import type { Song } from '../state/gameTypes';
import generated from './hebrewSongs.generated.json';

// Hebrew deck — SOURCE OF TRUTH: hebrewSongs.generated.json.
//
// That JSON is produced by scripts/fetch_wikipedia_songs.py, which pulls every song in the
// Hebrew Wikipedia category "שירים בעברית" and resolves each one's artist and release year
// from Wikidata (songs missing any of name/artist/year are dropped at generation time).
// Don't hand-edit the list here — re-run the fetch script to regenerate the JSON, then
// `npm run prefetch` to bake preview URLs (scripts/fetch-previews.mjs reads the same JSON).
//
// We map each generated record to the game's Song shape: the gameplay `title` is the song's
// `name` (Wikipedia's disambiguation suffix already stripped), and the stable id is derived
// from the immutable Wikipedia pageid so preview URLs keyed by id stay valid across re-runs.

interface GeneratedSong {
  pageid: number;
  name: string;
  artist: string;
  year: number;
  title: string;
  url: string;
}

export const hebrewSongId = (pageid: number): string => `h${pageid}`;

export const HEBREW_SONGS: Song[] = (generated as GeneratedSong[]).map((s) => ({
  id: hebrewSongId(s.pageid),
  title: s.name,
  artist: s.artist,
  year: s.year,
}));
