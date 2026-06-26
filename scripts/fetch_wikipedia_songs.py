#!/usr/bin/env python3
"""Fetch the full list of songs in the Hebrew Wikipedia category "שירים בעברית".

The category page (https://he.wikipedia.org/wiki/קטגוריה:שירים_בעברית) shows the list
in HTML with "next page" pagination. Rather than scrape that, we hit the MediaWiki API's
``list=categorymembers``, which exposes the same list and walks every page via the
``cmcontinue`` token — so we get all members regardless of how many HTML pages there are.

For each song we then resolve the performing artist and release year. Wikipedia articles
don't expose those as structured data, but their linked Wikidata entity does: the
"performer" property (P175) and "publication date" (P577). So we (1) map each article to
its Wikidata QID, (2) read P175 and P577 off those entities, and (3) resolve the performer
QIDs to Hebrew names — all in batches of 50 to keep request counts low. Songs whose
Wikidata entry lacks a performer/date get an empty ``artist`` / ``null`` ``year``.

Output: src/data/hebrewSongs.generated.json — an array of
{pageid, name, artist, year, title, url}. This file is the source of truth for the Hebrew
deck: src/data/hebrewSongs.ts maps it into Song[], and scripts/fetch-previews.mjs reads it
to bake preview URLs. Re-run `npm run prefetch` after regenerating it.
Run with: python3 scripts/fetch_wikipedia_songs.py

Uses only the Python standard library (no pip install needed).
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_FILE = ROOT / "src" / "data" / "hebrewSongs.generated.json"

WIKI_API = "https://he.wikipedia.org/w/api.php"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"
CATEGORY = "קטגוריה:שירים בעברית"
WIKI_BASE = "https://he.wikipedia.org/wiki/"
USER_AGENT = "hitster-song-fetcher/1.0 (https://github.com/)"

PERFORMER_PROP = "P175"  # Wikidata "performer"
PUBDATE_PROP = "P577"  # Wikidata "publication date"
BATCH = 50  # API limit for pageids / entity ids per request

# Wikidata times look like "+2011-03-00T00:00:00Z"; grab the (optionally negative) year.
_YEAR_RE = re.compile(r"^([+-]?\d{1,})-")

# Wikipedia adds a trailing parenthetical to disambiguate article titles
# (e.g. "אדם בתוך עצמו (שיר)", "17 (שיר של בן ארצי)"). The song's actual name is the
# title without that suffix, so strip a single trailing "(...)" group.
_DISAMBIG_RE = re.compile(r"\s*\([^()]*\)\s*$")


def song_name(title):
    return _DISAMBIG_RE.sub("", title).strip()


def api_get(base, params, retries=3):
    """GET a MediaWiki/Wikidata API endpoint, returning parsed JSON."""
    url = f"{base}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.load(resp)
            if "error" in data:
                raise RuntimeError(f"API error: {data['error']}")
            return data
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(1 + attempt)


def chunked(seq, size):
    for i in range(0, len(seq), size):
        yield seq[i : i + size]


def fetch_all_members():
    songs = []
    cmcontinue = None
    page = 0

    while True:
        params = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": CATEGORY,
            "cmtype": "page",  # articles only — skip subcategories and talk pages
            "cmlimit": "500",  # API max per request; fewer requests, same result
            "format": "json",
        }
        if cmcontinue:
            params["cmcontinue"] = cmcontinue

        data = api_get(WIKI_API, params)
        for m in data["query"]["categorymembers"]:
            title = m["title"]
            songs.append(
                {
                    "pageid": m["pageid"],
                    "name": song_name(title),
                    "artist": "",  # filled in by add_artists_and_years()
                    "year": None,  # filled in by add_artists_and_years()
                    "title": title,  # raw Wikipedia article title, kept for reference
                    "url": WIKI_BASE + urllib.parse.quote(title.replace(" ", "_")),
                }
            )

        page += 1
        sys.stdout.write(f"\rFetched page {page} — {len(songs)} songs so far...")
        sys.stdout.flush()

        cmcontinue = data.get("continue", {}).get("cmcontinue")
        if not cmcontinue:
            break
        time.sleep(0.2)  # be polite to the API

    sys.stdout.write("\n")
    return songs


def fetch_qids(pageids):
    """Map each Wikipedia pageid to its linked Wikidata QID."""
    qid_by_pageid = {}
    for i, batch in enumerate(chunked(pageids, BATCH), 1):
        data = api_get(
            WIKI_API,
            {
                "action": "query",
                "pageids": "|".join(str(p) for p in batch),
                "prop": "pageprops",
                "ppprop": "wikibase_item",
                "format": "json",
            },
        )
        for page in data["query"]["pages"].values():
            qid = page.get("pageprops", {}).get("wikibase_item")
            if qid:
                qid_by_pageid[page["pageid"]] = qid
        sys.stdout.write(f"\rResolving Wikidata ids — batch {i} ({len(qid_by_pageid)} found)...")
        sys.stdout.flush()
        time.sleep(0.2)
    sys.stdout.write("\n")
    return qid_by_pageid


def claim_year(claim):
    """Extract a year (int) from a P577 time claim, or None."""
    time_str = claim.get("mainsnak", {}).get("datavalue", {}).get("value", {}).get("time")
    if not time_str:
        return None
    m = _YEAR_RE.match(time_str)
    return int(m.group(1)) if m else None


def fetch_song_claims(qids):
    """For each song QID, return its performer QIDs (P175) and release year (P577).

    Returns {qid: {"performers": [qid, ...], "year": int | None}}. The year is the earliest
    publication date found, which matters for songs released/re-released multiple times.
    """
    claims_by_qid = {}
    for i, batch in enumerate(chunked(qids, BATCH), 1):
        data = api_get(
            WIKIDATA_API,
            {
                "action": "wbgetentities",
                "ids": "|".join(batch),
                "props": "claims",
                "format": "json",
            },
        )
        for qid, entity in data.get("entities", {}).items():
            claims = entity.get("claims", {})

            performers = []
            for claim in claims.get(PERFORMER_PROP, []):
                pid = claim.get("mainsnak", {}).get("datavalue", {}).get("value", {}).get("id")
                if pid:
                    performers.append(pid)

            years = [y for c in claims.get(PUBDATE_PROP, []) if (y := claim_year(c)) is not None]
            year = min(years) if years else None

            if performers or year is not None:
                claims_by_qid[qid] = {"performers": performers, "year": year}
        sys.stdout.write(f"\rReading performers & years — batch {i}...")
        sys.stdout.flush()
        time.sleep(0.2)
    sys.stdout.write("\n")
    return claims_by_qid


def fetch_labels(qids):
    """Resolve performer QIDs to names, preferring Hebrew and falling back to English."""
    label_by_qid = {}
    qids = list(qids)
    for i, batch in enumerate(chunked(qids, BATCH), 1):
        data = api_get(
            WIKIDATA_API,
            {
                "action": "wbgetentities",
                "ids": "|".join(batch),
                "props": "labels",
                "languages": "he|en",
                "format": "json",
            },
        )
        for qid, entity in data.get("entities", {}).items():
            labels = entity.get("labels", {})
            label = labels.get("he", {}).get("value") or labels.get("en", {}).get("value")
            if label:
                label_by_qid[qid] = label
        sys.stdout.write(f"\rResolving artist names — batch {i}...")
        sys.stdout.flush()
        time.sleep(0.2)
    sys.stdout.write("\n")
    return label_by_qid


def add_artists_and_years(songs):
    qid_by_pageid = fetch_qids([s["pageid"] for s in songs])
    claims_by_qid = fetch_song_claims(sorted(set(qid_by_pageid.values())))

    all_performer_qids = {
        pid for claims in claims_by_qid.values() for pid in claims["performers"]
    }
    label_by_qid = fetch_labels(all_performer_qids)

    for s in songs:
        qid = qid_by_pageid.get(s["pageid"])
        claims = claims_by_qid.get(qid) if qid else None
        performer_qids = claims["performers"] if claims else []
        names = [label_by_qid.get(pid, "") for pid in performer_qids]
        s["artist"] = ", ".join(n for n in names if n)
        s["year"] = claims["year"] if claims else None


def main():
    songs = fetch_all_members()
    fetched = len(songs)
    add_artists_and_years(songs)

    # Keep only songs for which every required field resolved — a song missing its name,
    # artist, or year is incomplete and not useful, so drop it rather than emit blanks.
    songs = [s for s in songs if s["name"] and s["artist"] and s["year"] is not None]

    # Stable, human-friendly order.
    songs.sort(key=lambda s: s["name"])
    OUT_FILE.write_text(json.dumps(songs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {len(songs)} complete songs to {OUT_FILE} "
        f"(dropped {fetched - len(songs)} missing a name, artist, or year)"
    )


if __name__ == "__main__":
    main()
