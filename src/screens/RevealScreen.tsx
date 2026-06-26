import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { Timeline } from '../components/Timeline';
import type { GameState, Player, Song } from '../state/gameTypes';

interface Props {
  state: GameState;
  card: Song;
  activePlayer: Player;
  onAwardBonus: () => void;
  onNext: () => void;
}

export function RevealScreen({ state, card, activePlayer, onAwardBonus, onNext }: Props) {
  const { lastPlacementCorrect, lastCardWinnerId, steal, attemptingName, settings, players } = state;
  const [bonusHandled, setBonusHandled] = useState(!attemptingName);

  const winner = players.find((p) => p.id === lastCardWinnerId) ?? null;
  const stoleIt = steal !== null && winner !== null && winner.id === steal.playerId;

  let headline: string;
  let tone: string;
  if (stoleIt) {
    headline = `${winner!.name} stole it! 🦹`;
    tone = 'text-amber-300';
  } else if (lastPlacementCorrect) {
    headline = 'Correct! 🎉';
    tone = 'text-emerald-300';
  } else {
    headline = 'Not quite 😬';
    tone = 'text-rose-300';
  }

  // Whose timeline to display: the player who received the card, else the active player's.
  const shown = winner ?? activePlayer;

  // Celebrate when the card was won (placed correctly or stolen).
  const celebrate = stoleIt || Boolean(lastPlacementCorrect);

  return (
    <div className="flex min-h-full flex-col px-4 py-6">
      {celebrate && <Confetti />}
      <div className="text-center">
        <motion.h2
          key={headline}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          className={`text-2xl font-black ${tone}`}
        >
          {headline}
        </motion.h2>
      </div>

      {/* Flipping card reveal */}
      <div className="my-5 flex justify-center [perspective:1000px]">
        <motion.div
          initial={{ rotateY: 180 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="relative h-56 w-44 rounded-2xl shadow-2xl [transform-style:preserve-3d]"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/15 [backface-visibility:hidden]">
            <div className="text-5xl font-black text-violet-300">{card.year}</div>
            <div dir="auto" className="mt-3 text-base font-bold leading-tight">
              {card.title}
            </div>
            <div dir="auto" className="mt-1 text-sm text-white/50">
              {card.artist}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Name-the-song bonus self-report */}
      {attemptingName && !bonusHandled && (
        <div className="mx-auto mb-4 max-w-sm rounded-xl bg-amber-400/10 p-4 text-center ring-1 ring-amber-400/30">
          <p className="text-sm text-amber-200">
            Did {activePlayer.name} correctly name <strong>both</strong> the title and artist?
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Button
              variant="token"
              onClick={() => {
                onAwardBonus();
                setBonusHandled(true);
              }}
            >
              Yes — award 🎵
            </Button>
            <Button variant="ghost" onClick={() => setBonusHandled(true)}>
              No
            </Button>
          </div>
        </div>
      )}

      <div className="my-auto">
        <div className="mb-2 text-center text-xs uppercase tracking-wider text-white/40">
          {shown.name}’s timeline
        </div>
        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/5">
          <Timeline timeline={shown.timeline} />
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="w-full !py-4 text-base"
          disabled={attemptingName && !bonusHandled}
          onClick={onNext}
        >
          {state.players.some((p) => p.timeline.length >= settings.targetCards)
            ? 'See results →'
            : 'Next turn →'}
        </Button>
      </div>
    </div>
  );
}
