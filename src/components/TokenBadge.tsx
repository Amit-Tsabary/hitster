/** Small pill showing a player's HITSTER token count. */
export function TokenBadge({ tokens }: { tokens: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30"
      title="HITSTER tokens"
    >
      <span className="text-sm leading-none">🎵</span>
      {tokens}
    </span>
  );
}
