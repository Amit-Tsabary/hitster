import type { Player } from '../state/gameTypes';
import { TokenBadge } from './TokenBadge';

/** Top bar showing the active player, their progress, and tokens. */
export function PlayerHeader({
  player,
  target,
  useTokens,
}: {
  player: Player;
  target: number;
  useTokens: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-200 ring-1 ring-violet-400/40">
          {player.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold leading-tight">{player.name}</div>
          <div className="text-[11px] text-white/50 leading-tight">
            {player.timeline.length} / {target} cards
          </div>
        </div>
      </div>
      {useTokens && <TokenBadge tokens={player.tokens} />}
    </div>
  );
}
