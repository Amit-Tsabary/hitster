import type { DeckId, Song } from '../state/gameTypes';
import { SONGS } from './songs';
import { HEBREW_SONGS } from './hebrewSongs';

export type { DeckId };

export interface DeckInfo {
  id: DeckId;
  /** Short label shown in the deck picker. */
  name: string;
  /** One-line description for the picker. */
  blurb: string;
  songs: Song[];
}

export const DECKS: DeckInfo[] = [
  { id: 'regular', name: 'Regular', blurb: 'Global pop & rock hits', songs: SONGS },
  { id: 'hebrew', name: 'Hebrew', blurb: 'Israeli & Hebrew songs only', songs: HEBREW_SONGS },
];

/** Lookup of every song across all decks, by id. Song ids are unique across decks. */
const SONG_BY_ID = new Map<string, Song>(
  DECKS.flatMap((d) => d.songs).map((s) => [s.id, s]),
);

export function findSong(id: string): Song {
  const s = SONG_BY_ID.get(id);
  if (!s) throw new Error(`Unknown song id ${id}`);
  return s;
}

export function getDeckSongs(deckId: DeckId): Song[] {
  return (DECKS.find((d) => d.id === deckId) ?? DECKS[0]).songs;
}
