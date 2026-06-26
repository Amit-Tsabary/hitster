import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { MysteryCard } from '../components/Card';
import type { Player, Settings } from '../state/gameTypes';
import { FREE_CARD_COST, SKIP_COST } from '../state/gameTypes';
import type { AudioStatus } from '../hooks/useAudioPreview';

interface Props {
  player: Player;
  settings: Settings;
  audio: {
    status: AudioStatus;
    progress: number;
    play: () => void;
    pause: () => void;
    replay: () => void;
  };
  onContinue: () => void;
  onSkip: () => void;
  onFreeCard: () => void;
}

export function TurnHiddenScreen({ player, settings, audio, onContinue, onSkip, onFreeCard }: Props) {
  // "Pass the device" curtain so the previous player can't see the new turn.
  const [revealed, setRevealed] = useState(false);
  const { status, progress, play, pause, replay } = audio;
  const playing = status === 'playing';

  if (!revealed) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="text-sm uppercase tracking-widest text-white/40">Pass the device to</div>
        <div className="text-4xl font-black text-violet-300">{player.name}</div>
        <p className="max-w-xs text-sm text-white/40">
          Don’t let anyone else see the screen — and no peeking at smartwatches!
        </p>
        <Button className="mt-2 !px-10 !py-4 text-base" onClick={() => setRevealed(true)}>
          I’m {player.name}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-8 text-center">
      <div className="text-sm uppercase tracking-widest text-white/40">{player.name}’s turn</div>
      <MysteryCard playing={playing} />

      {/* progress bar */}
      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-[width] duration-200"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-3">
        {status === 'loading' && <span className="text-sm text-white/40">Loading preview…</span>}
        {status === 'unavailable' && (
          <span className="text-sm text-white/40">Finding another song…</span>
        )}
        {(status === 'ready' || status === 'playing') && (
          <>
            <Button variant="ghost" onClick={replay} aria-label="Replay">
              ⟲
            </Button>
            <motion.button
              onClick={playing ? pause : play}
              whileTap={{ scale: 0.9 }}
              // A gentle heartbeat invites the first tap; it settles once the song is playing.
              animate={playing ? { scale: 1 } : { scale: [1, 1.06, 1] }}
              transition={playing ? { duration: 0.2 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="grid h-16 w-16 place-items-center rounded-full bg-violet-600 text-2xl shadow-lg shadow-violet-900/50 hover:bg-violet-500"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? '❚❚' : '▶'}
            </motion.button>
            <div className="w-12" />
          </>
        )}
      </div>

      {settings.useTokens && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="token"
            disabled={player.tokens < SKIP_COST}
            onClick={onSkip}
            title="Spend 1 token to skip this song"
          >
            Skip song · {SKIP_COST}🎵
          </Button>
          <Button
            variant="token"
            disabled={player.tokens < FREE_CARD_COST}
            onClick={onFreeCard}
            title="Spend 3 tokens to take a card with no guessing"
          >
            Free card · {FREE_CARD_COST}🎵
          </Button>
        </div>
      )}

      <Button
        className="mt-2 !px-10 text-base"
        disabled={status === 'loading'}
        onClick={onContinue}
      >
        Place it on my timeline →
      </Button>
    </div>
  );
}
