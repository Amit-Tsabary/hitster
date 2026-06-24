// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

// Don't hit the real iTunes API in tests; pretend every song has a preview.
vi.mock('./services/audioSource', () => ({
  getPreviewUrl: vi.fn().mockResolvedValue('https://example.com/preview.m4a'),
}));

// jsdom doesn't implement media playback.
beforeAll(() => {
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLMediaElement.prototype.pause = vi.fn();
  HTMLMediaElement.prototype.load = vi.fn();
});

afterEach(cleanup);

function startTwoPlayerGame() {
  render(<App />);
  const inputs = screen.getAllByRole('textbox');
  fireEvent.change(inputs[0], { target: { value: 'Ada' } });
  fireEvent.change(inputs[1], { target: { value: 'Bo' } });
  fireEvent.click(screen.getByText('Start game'));
}

describe('App smoke flow', () => {
  it('renders the setup screen', () => {
    render(<App />);
    expect(screen.getByText('HITSTER')).toBeTruthy();
    expect(screen.getByText('Start game')).toBeTruthy();
  });

  it('plays through a full turn: setup → hidden → placing → challenge → reveal → next turn', async () => {
    startTwoPlayerGame();

    // Pass-the-device curtain for whoever goes first.
    const passBtn = await screen.findByText(/I’m (Ada|Bo)/);
    fireEvent.click(passBtn);

    // Hidden screen → go place it.
    fireEvent.click(await screen.findByText(/Place it on my timeline/));

    // Placement: pick the first slot, then lock in.
    fireEvent.click(screen.getByLabelText('Place at position 1'));
    fireEvent.click(screen.getByText('Lock in placement'));

    // Challenge window appears (tokens on, the other player has tokens). Decline.
    fireEvent.click(await screen.findByText('No challenge — reveal'));

    // Reveal screen, then advance.
    const next = await screen.findByText(/Next turn|See results/);
    fireEvent.click(next);

    // Back to a hidden turn for the next player.
    expect(await screen.findByText('Pass the device to')).toBeTruthy();
  });

  it('lets a player skip a song with a token', async () => {
    startTwoPlayerGame();
    fireEvent.click(await screen.findByText(/I’m (Ada|Bo)/));
    // Skip costs one token; the button should be enabled at the starting count of 2.
    const skip = await screen.findByText(/Skip song/);
    fireEvent.click(skip);
    // Still on the hidden screen, now with a fresh mystery song.
    expect(screen.getByText(/’s turn/)).toBeTruthy();
  });
});
