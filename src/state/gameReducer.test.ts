import { describe, expect, it } from 'vitest';
import { gameReducer, isPlacementCorrect, insertSorted, shuffle } from './gameReducer';
import type { GameState, Player, Song } from './gameTypes';

const song = (year: number, id = `s${year}`): Song => ({
  id,
  title: `t${year}`,
  artist: 'a',
  year,
});

const player = (id: string, timeline: Song[], tokens = 2): Player => ({
  id,
  name: id,
  timeline,
  tokens,
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

describe('CONFIRM_PLACEMENT with a steal', () => {
  // Active player (p0) timeline; challenger (p1) has a different timeline.
  // Card year 1980 belongs at slot 1 on p0's timeline (between 1970 and 1990).
  const base = (steal: GameState['steal'], pendingSlot: number): GameState => ({
    players: [player('p0', [song(1970), song(1990)]), player('p1', [song(2000)])],
    deck: [],
    drawIndex: 0,
    currentPlayerIdx: 0,
    phase: 'placing',
    currentCard: song(1980),
    pendingSlot,
    attemptingName: false,
    steal,
    settings: { useTokens: true, startingTokens: 2, targetCards: 10, deck: 'regular' },
    winnerId: null,
    lastPlacementCorrect: null,
    lastCardWinnerId: null,
  });

  it('judges the steal against the ACTIVE player\'s timeline, not the challenger\'s', () => {
    // Active places wrong (slot 0); challenger picks slot 1 — correct on p0's timeline.
    const next = gameReducer(base({ playerId: 'p1', slotIndex: 1 }, 0), {
      type: 'CONFIRM_PLACEMENT',
    });
    expect(next.lastCardWinnerId).toBe('p1');
    // Challenger receives the stolen card into their own timeline.
    expect(next.players[1].timeline.map((s) => s.year)).toEqual([1980, 2000]);
    expect(next.players[0].timeline).toHaveLength(2); // active gains nothing
    expect(next.lastPlacementCorrect).toBe(false);
  });

  it('fails the steal when the challenger picks a wrong slot on the active timeline', () => {
    // Card 1980 does NOT belong at slot 2 (after 1990). Active also wrong at slot 0.
    const next = gameReducer(base({ playerId: 'p1', slotIndex: 2 }, 0), {
      type: 'CONFIRM_PLACEMENT',
    });
    expect(next.lastCardWinnerId).toBeNull();
    expect(next.players[1].timeline).toHaveLength(1);
  });

  it('ignores a steal that copies the active player\'s slot (no agree-and-steal)', () => {
    // Active places correctly at slot 1; challenger copies slot 1. Steal must not fire —
    // active keeps the card.
    const next = gameReducer(base({ playerId: 'p1', slotIndex: 1 }, 1), {
      type: 'CONFIRM_PLACEMENT',
    });
    expect(next.lastCardWinnerId).toBe('p0');
    expect(next.players[0].timeline.map((s) => s.year)).toEqual([1970, 1980, 1990]);
    expect(next.players[1].timeline).toHaveLength(1);
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
