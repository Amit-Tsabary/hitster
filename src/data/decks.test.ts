import { describe, expect, it } from 'vitest';
import { DECKS, getDeckSongs } from './decks';
import { SONGS } from './songs';
import { HEBREW_SONGS } from './hebrewSongs';

describe('decks', () => {
  it('includes every song in its deck (previews resolve on demand)', () => {
    expect(getDeckSongs('regular').length).toBe(SONGS.length);
    expect(getDeckSongs('hebrew').length).toBe(HEBREW_SONGS.length);
  });

  it('leaves enough songs to play in each deck', () => {
    expect(getDeckSongs('regular').length).toBeGreaterThan(20);
    expect(getDeckSongs('hebrew').length).toBeGreaterThan(20);
  });

  it('gives every song a unique id within each deck', () => {
    for (const deck of DECKS) {
      const ids = new Set(deck.songs.map((s) => s.id));
      expect(ids.size).toBe(deck.songs.length);
    }
  });
});
