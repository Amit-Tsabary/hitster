import { describe, expect, it } from 'vitest';
import { DECKS, getDeckSongs } from './decks';
import { SONGS } from './songs';
import { HEBREW_SONGS } from './hebrewSongs';
import { PREVIEW_URLS } from './previewUrls.generated';

describe('deck playability filter', () => {
  it('only includes songs that have a baked preview URL', () => {
    for (const deck of DECKS) {
      for (const song of deck.songs) {
        expect(PREVIEW_URLS[song.id], `${song.id} ${song.title}`).toBeTruthy();
      }
    }
  });

  it('excludes any song without a preview from its deck', () => {
    const regularExcluded = SONGS.filter((s) => !PREVIEW_URLS[s.id]).map((s) => s.id);
    const hebrewExcluded = HEBREW_SONGS.filter((s) => !PREVIEW_URLS[s.id]).map((s) => s.id);
    const regularIds = new Set(getDeckSongs('regular').map((s) => s.id));
    const hebrewIds = new Set(getDeckSongs('hebrew').map((s) => s.id));
    for (const id of regularExcluded) expect(regularIds.has(id)).toBe(false);
    for (const id of hebrewExcluded) expect(hebrewIds.has(id)).toBe(false);
  });

  it('leaves enough songs to play in each deck', () => {
    expect(getDeckSongs('regular').length).toBeGreaterThan(20);
    expect(getDeckSongs('hebrew').length).toBeGreaterThan(20);
  });
});
