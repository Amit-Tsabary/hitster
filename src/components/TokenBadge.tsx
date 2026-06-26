import { motion } from 'framer-motion';

/** Small pill showing a player's HITSTER token count. Pops when the count changes. */
export function TokenBadge({ tokens }: { tokens: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30"
      title="HITSTER tokens"
    >
      <span className="text-sm leading-none">🎵</span>
      {/* Re-key on the value so each change springs in. */}
      <motion.span
        key={tokens}
        initial={{ scale: 1.6, color: '#fde68a' }}
        animate={{ scale: 1, color: '#fcd34d' }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className="inline-block tabular-nums"
      >
        {tokens}
      </motion.span>
    </span>
  );
}
