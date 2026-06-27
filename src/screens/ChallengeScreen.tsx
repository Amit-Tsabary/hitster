import { useState } from 'react';
import { Button } from '../components/Button';
import { Timeline } from '../components/Timeline';
import { TokenBadge } from '../components/TokenBadge';
import type { Player } from '../state/gameTypes';
import { STEAL_COST } from '../state/gameTypes';

interface Props {
  players: Player[];
  activePlayerId: string;
  /** The slot the active player committed to — challengers must disagree, so it's locked. */
  activeSlot: number | null;
  onSteal: (playerId: string, slotIndex: number) => void;
  onSkip: () => void;
}

/**
 * The steal window: after the active player locks in, anyone else with a token may shout
 * "HITSTER!" to challenge. A challenge is a *disagreement* with the active player's placement,
 * so the challenger places the (still hidden) card on the ACTIVE player's timeline, in a
 * different slot than the active player chose — if that slot is right, they steal the card.
 * The card's year stays concealed here.
 */
export function ChallengeScreen({ players, activePlayerId, activeSlot, onSteal, onSkip }: Props) {
  const [challenger, setChallenger] = useState<Player | null>(null);
  const [slot, setSlot] = useState<number | null>(null);

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const eligible = players.filter((p) => p.id !== activePlayerId && p.tokens >= STEAL_COST);

  if (challenger && activePlayer) {
    return (
      <div className="flex min-h-full flex-col px-4 py-6">
        <div className="text-center">
          <div className="text-sm uppercase tracking-widest text-amber-300">HITSTER! steal</div>
          <h2 className="mt-1 text-xl font-bold">
            {challenger.name}, where does it belong on {activePlayer.name}'s timeline?
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Spend 1 🎵. Pick a different spot than ★ — guess right and you steal the card.
          </p>
        </div>
        <div className="my-auto rounded-2xl bg-white/[0.03] ring-1 ring-white/5">
          <Timeline
            timeline={activePlayer.timeline}
            selectable
            selectedSlot={slot}
            lockedSlot={activeSlot}
            onSelectSlot={setSlot}
          />
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setChallenger(null)}>
            Back
          </Button>
          <Button
            className="flex-1 !py-4"
            disabled={slot === null}
            onClick={() => slot !== null && onSteal(challenger.id, slot)}
          >
            Steal it
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-8 text-center">
      <div className="text-sm uppercase tracking-widest text-white/40">Anyone want to steal?</div>
      <p className="max-w-xs text-sm text-white/50">
        If you think the placement is wrong, shout “HITSTER!” and spend a token to grab the card.
      </p>

      {eligible.length === 0 ? (
        <p className="text-sm text-white/30">No one else has a token to spend.</p>
      ) : (
        <div className="flex w-full max-w-xs flex-col gap-2">
          {eligible.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSlot(null);
                setChallenger(p);
              }}
              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 hover:bg-white/10"
            >
              <span className="font-semibold">{p.name}</span>
              <TokenBadge tokens={p.tokens} />
            </button>
          ))}
        </div>
      )}

      <Button variant="ghost" className="!px-10" onClick={onSkip}>
        No challenge — reveal
      </Button>
    </div>
  );
}
