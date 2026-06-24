import { describe, expect, it } from 'vitest';
import { isPlacementCorrect, insertSorted, shuffle } from './gameReducer';
import type { Song } from './gameTypes';

const song = (year: number, id = `s${year}`): Song => ({
  id,
  title: `t${year}`,
  artist: 'a',
  year,
});

describe('isPlacementCorrect', () => {
  const tl = [song(1970), song(1990), song(2010)]; // slots: 0 | 1 | 2 | 3

  it('accepts a year before the first card at slot 0', () => {
    expect(isPlacementCorrect(tl, 0, 1960)).toBe(true);
  });

  it('rejects a too-new year at slot 0', () => {
    expect(isPlacementCorrect(tl, 0, 1980)).toBe(false);
  });

  it('accepts a year between two cards at the matching slot', () => {
    expect(isPlacementCorrect(tl, 1, 1980)).toBe(true);
    expect(isPlacementCorrect(tl, 2, 2000)).toBe(true);
  });

  it('rejects a between-year placed in the wrong slot', () => {
    expect(isPlacementCorrect(tl, 2, 1980)).toBe(false);
    expect(isPlacementCorrect(tl, 1, 2000)).toBe(false);
  });

  it('accepts a year after the last card at the final slot', () => {
    expect(isPlacementCorrect(tl, 3, 2020)).toBe(true);
  });

  it('rejects a too-old year at the final slot', () => {
    expect(isPlacementCorrect(tl, 3, 1980)).toBe(false);
  });

  it('treats ties at a boundary as correct on either side', () => {
    expect(isPlacementCorrect(tl, 0, 1970)).toBe(true); // == first card
    expect(isPlacementCorrect(tl, 1, 1970)).toBe(true); // == left neighbor
    expect(isPlacementCorrect(tl, 1, 1990)).toBe(true); // == right neighbor
    expect(isPlacementCorrect(tl, 2, 1990)).toBe(true);
  });

  it('always accepts placement onto an empty timeline', () => {
    expect(isPlacementCorrect([], 0, 1999)).toBe(true);
  });

  it('handles a single-card timeline on both sides', () => {
    const one = [song(2000)];
    expect(isPlacementCorrect(one, 0, 1990)).toBe(true);
    expect(isPlacementCorrect(one, 1, 2010)).toBe(true);
    expect(isPlacementCorrect(one, 0, 2010)).toBe(false);
    expect(isPlacementCorrect(one, 1, 1990)).toBe(false);
  });
});

describe('insertSorted', () => {
  it('keeps the timeline sorted ascending by year', () => {
    const tl = [song(1970), song(2010)];
    const out = insertSorted(tl, song(1990));
    expect(out.map((s) => s.year)).toEqual([1970, 1990, 2010]);
  });

  it('does not mutate the input', () => {
    const tl = [song(1970)];
    insertSorted(tl, song(1990));
    expect(tl).toHaveLength(1);
  });
});

describe('shuffle', () => {
  it('returns a permutation of the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual(input);
  });
});
