import type { Song } from '../state/gameTypes';

// Fetches a 30s preview URL for a song from the iTunes Search API (free, no auth, CORS-enabled).
// Results are cached in localStorage by song id, which keeps replays instant and stays well under
// the ~20 req/min rate limit. We deliberately ignore iTunes' release year (unreliable) — only the
// preview audio is used; the canonical year lives in data/songs.ts.

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
  return s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
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
  const cache = readCache();
  if (song.id in cache) return cache[song.id];

  const term = encodeURIComponent(`${song.artist} ${song.title}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`iTunes ${res.status}`);
    const data: { results?: ITunesResult[] } = await res.json();
    const preview = bestMatch(data.results ?? [], song);
    cache[song.id] = preview;
    writeCache(cache);
    return preview;
  } catch (err) {
    console.warn('Preview lookup failed for', song.title, err);
    return null; // transient failure: don't poison the cache
  }
}
