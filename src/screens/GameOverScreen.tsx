import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { TokenBadge } from '../components/TokenBadge';
import type { Player } from '../state/gameTypes';

export function GameOverScreen({
  players,
  winnerId,
  useTokens,
  onReset,
}: {
  players: Player[];
  winnerId: string | null;
  useTokens: boolean;
  onReset: () => void;
}) {
  const ranked = [...players].sort((a, b) => b.timeline.length - a.timeline.length);
  const winner = players.find((p) => p.id === winnerId);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <Confetti count={120} />
      <motion.div
        className="text-6xl"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.1 }}
      >
        🏆
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-sheen mt-3 bg-gradient-to-r from-amber-300 via-fuchsia-400 to-amber-300 bg-clip-text text-4xl font-black text-transparent"
      >
        {winner ? `${winner.name} wins!` : 'Game over'}
      </motion.h1>

      <div className="mt-8 w-full space-y-2">
        {ranked.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              p.id === winnerId ? 'bg-amber-400/15 ring-1 ring-amber-400/40' : 'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-sm text-white/40">{i + 1}</span>
              <span className="font-semibold">{p.name}</span>
              {useTokens && <TokenBadge tokens={p.tokens} />}
            </div>
            <span className="text-sm font-bold text-white/70">{p.timeline.length} cards</span>
          </motion.div>
        ))}
      </div>

      <Button className="mt-10 w-full !py-4 text-base" onClick={onReset}>
        Play again
      </Button>
    </div>
  );
}
