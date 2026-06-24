import { Button } from '../components/Button';
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
      <div className="text-6xl">🏆</div>
      <h1 className="mt-3 bg-gradient-to-r from-amber-300 to-fuchsia-400 bg-clip-text text-4xl font-black text-transparent">
        {winner ? `${winner.name} wins!` : 'Game over'}
      </h1>

      <div className="mt-8 w-full space-y-2">
        {ranked.map((p, i) => (
          <div
            key={p.id}
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
          </div>
        ))}
      </div>

      <Button className="mt-10 w-full !py-4 text-base" onClick={onReset}>
        Play again
      </Button>
    </div>
  );
}
