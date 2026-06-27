// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ChallengeScreen } from './ChallengeScreen';
import type { Player } from '../state/gameTypes';

afterEach(cleanup);

const player = (id: string, year: number): Player => ({
  id,
  name: id,
  timeline: [{ id: `s${year}`, title: `t${year}`, artist: 'a', year }],
  tokens: 2,
});

describe('ChallengeScreen', () => {
  // Active player A holds 1990; challenger B holds 2000. A picked slot 0 ("earlier").
  const players = [player('A', 1990), player('B', 2000)];

  it('places the challenge on the ACTIVE player\'s timeline, not the challenger\'s', () => {
    render(
      <ChallengeScreen
        players={players}
        activePlayerId="A"
        activeSlot={0}
        onSteal={vi.fn()}
        onSkip={vi.fn()}
      />,
    );

    // Pick challenger B.
    fireEvent.click(screen.getByText('B'));

    // We're now placing on A's timeline: A's card (1990) shows, B's card (2000) does not.
    expect(screen.getByText('1990')).toBeTruthy();
    expect(screen.queryByText('2000')).toBeNull();

    // A's chosen slot (0) is locked; the "after 1990" slot (position 2) is still selectable.
    expect(screen.getByLabelText("Active player's placement at position 1")).toBeTruthy();
    expect(screen.getByLabelText('Place at position 2')).toBeTruthy();
  });

  it('reports the slot chosen on the active timeline', () => {
    const onSteal = vi.fn();
    render(
      <ChallengeScreen
        players={players}
        activePlayerId="A"
        activeSlot={0}
        onSteal={onSteal}
        onSkip={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('B'));
    fireEvent.click(screen.getByLabelText('Place at position 2')); // "after 1990" = slot 1
    fireEvent.click(screen.getByText('Steal it'));

    expect(onSteal).toHaveBeenCalledWith('B', 1);
  });
});
