import type { DeckId, Song } from '../state/gameTypes';
import { SONGS } from './songs';
import { HEBREW_SONGS } from './hebrewSongs';
import { PREVIEW_URLS } from './previewUrls.generated';

export type { DeckId };

export interface DeckInfo {
  id: DeckId;
  /** Short label shown in the deck picker. */
  name: string;
  /** One-line description for the picker. */
  blurb: string;
  songs: Song[];
}

// A song is only playable if we have a baked 30s preview for it (see scripts/fetch-previews.mjs).
// Songs without a preview are excluded from the deck entirely so they never come up in a game.
// Re-run `npm run prefetch` after editing the decks to refresh which songs are playable.
const isPlayable = (s: Song): boolean => Boolean(PREVIEW_URLS[s.id]);

export const DECKS: DeckInfo[] = [
  { id: 'regular', name: 'Regular', blurb: 'Global pop & rock hits', songs: SONGS.filter(isPlayable) },
  { id: 'hebrew', name: 'Hebrew', blurb: 'Israeli & Hebrew songs only', songs: HEBREW_SONGS.filter(isPlayable) },
];

/** Lookup of every song across all decks, by id (includes non-playable songs, for safety). */
const SONG_BY_ID = new Map<string, Song>(
  [...SONGS, ...HEBREW_SONGS].map((s) => [s.id, s]),
);

export function findSong(id: string): Song {
  const s = SONG_BY_ID.get(id);
  if (!s) throw new Error(`Unknown song id ${id}`);
  return s;
}

export function getDeckSongs(deckId: DeckId): Song[] {
  return (DECKS.find((d) => d.id === deckId) ?? DECKS[0]).songs;
}
