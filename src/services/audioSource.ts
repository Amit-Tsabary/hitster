import type { Song } from '../state/gameTypes';
import { PREVIEW_URLS } from '../data/previewUrls.generated';

// Resolves a 30s preview URL for a song. The primary source is PREVIEW_URLS — a table baked
// at build time by scripts/fetch-previews.mjs (`npm run prefetch`). That keeps gameplay free of
// live API calls, which is important: hitting the iTunes Search API once per card quickly trips
// Apple's ~20 req/min per-IP rate limit, and throttled responses surfaced in the UI as
// "No preview found — skip to the next song." Any song missing from the baked table falls back
// to a live iTunes lookup (cached in localStorage), so newly added songs still work before the
// next prefetch. We deliberately ignore iTunes' release year (unreliable) — only the preview
// audio is used; the canonical year lives in data/songs.ts.

const CACHE_KEY = 'hitster:previewCache:v1';

type Cache = Record<string, string | null>;

function readCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeCache(cache: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function normalize(s: string): string {
  // Keep letters (any script, incl. Hebrew) and numbers; drop punctuation. Hebrew has no case,
  // so lowercasing is harmless and keeps Latin matching working.
  return s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ITunesResult {
  trackName?: string;
  artistName?: string;
  previewUrl?: string;
}

/** Pick the result whose artist+title best matches what we asked for. */
function bestMatch(results: ITunesResult[], song: Song): string | null {
  const wantArtist = normalize(song.artist);
  const wantTitle = normalize(song.title);
  let best: { url: string; score: number } | null = null;
  for (const r of results) {
    if (!r.previewUrl) continue;
    const artist = normalize(r.artistName ?? '');
    const title = normalize(r.trackName ?? '');
    let score = 0;
    if (artist.includes(wantArtist) || wantArtist.includes(artist)) score += 2;
    if (title.includes(wantTitle) || wantTitle.includes(title)) score += 2;
    if (best === null || score > best.score) best = { url: r.previewUrl, score };
  }
  return best && best.score > 0 ? best.url : (results.find((r) => r.previewUrl)?.previewUrl ?? null);
}

/**
 * Returns a 30s preview URL for the song, or null if none can be found (caller should skip/replace).
 */
export async function getPreviewUrl(song: Song): Promise<string | null> {
  // Baked table first — covers the whole deck and needs no network (see module header).
  const baked = PREVIEW_URLS[song.id];
  if (baked) return baked;

  const cache = readCache();
  if (song.id in cache) return cache[song.id];

  const term = encodeURIComponent(`${song.artist} ${song.title}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`;
  try {
    const res = await fetch(url);
    // When throttled, iTunes replies with the plain text "Rate limit exceeded" instead of JSON;
    // treat that (and any non-OK status) as a transient failure rather than poisoning the cache.
    const body = await res.text();
    if (!res.ok || body.trimStart().startsWith('Rate limit')) throw new Error(`iTunes ${res.status}`);
    const data: { results?: ITunesResult[] } = JSON.parse(body);
    const preview = bestMatch(data.results ?? [], song);
    cache[song.id] = preview;
    writeCache(cache);
    return preview;
  } catch (err) {
    console.warn('Preview lookup failed for', song.title, err);
    return null; // transient failure: don't poison the cache
  }
}
