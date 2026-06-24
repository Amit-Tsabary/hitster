import { useState } from 'react';
import { Button } from '../components/Button';
import { DECKS } from '../data/decks';
import type { DeckId, Settings } from '../state/gameTypes';

export function SetupScreen({ onStart }: { onStart: (names: string[], settings: Settings) => void }) {
  const [names, setNames] = useState<string[]>(['', '']);
  const [useTokens, setUseTokens] = useState(true);
  const [targetCards, setTargetCards] = useState(10);
  const [deck, setDeck] = useState<DeckId>('regular');

  const setName = (i: number, v: string) =>
    setNames((ns) => ns.map((n, j) => (j === i ? v : n)));
  const addPlayer = () => names.length < 6 && setNames((ns) => [...ns, '']);
  const removePlayer = (i: number) =>
    names.length > 2 && setNames((ns) => ns.filter((_, j) => j !== i));

  const canStart = names.filter((n) => n.trim()).length >= 2;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 py-8">
      <h1 className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-center text-5xl font-black tracking-tight text-transparent">
        HITSTER
      </h1>
      <p className="mt-2 text-center text-sm text-white/50">
        Hear a song. Place it on your timeline by year. No cards required.
      </p>

      <div className="mt-8 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-white/40">Players</div>
        {names.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-xs text-white/40">
              {i + 1}
            </span>
            <input
              value={n}
              onChange={(e) => setName(i, e.target.value)}
              placeholder={`Player ${i + 1}`}
              className="flex-1 rounded-xl bg-white/5 px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-violet-400/60"
            />
            {names.length > 2 && (
              <button
                onClick={() => removePlayer(i)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/30 hover:bg-white/5 hover:text-rose-300"
                aria-label="Remove player"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {names.length < 6 && (
          <button
            onClick={addPlayer}
            className="w-full rounded-xl border border-dashed border-white/15 py-2 text-sm text-white/50 hover:border-violet-300/50 hover:text-violet-200"
          >
            + Add player
          </button>
        )}
      </div>

      <div className="mt-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Deck</div>
        <div className="grid grid-cols-2 gap-2">
          {DECKS.map((d) => {
            const selected = deck === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDeck(d.id)}
                className={`rounded-2xl p-4 text-left ring-1 transition-colors ${
                  selected
                    ? 'bg-violet-500/20 ring-violet-400/60'
                    : 'bg-white/5 ring-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{d.name}</span>
                  {selected && <span className="text-violet-300">✓</span>}
                </div>
                <div className="mt-1 text-xs text-white/50">{d.blurb}</div>
                <div className="mt-1 text-[11px] text-white/30">{d.songs.length} songs</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <label className="flex items-center justify-between">
          <span className="text-sm">Use HITSTER tokens</span>
          <button
            onClick={() => setUseTokens((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              useTokens ? 'bg-violet-500' : 'bg-white/15'
            }`}
            aria-pressed={useTokens}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                useTokens ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </label>
        <div className="flex items-center justify-between">
          <span className="text-sm">Cards to win</span>
          <div className="flex items-center gap-1">
            {[5, 8, 10].map((t) => (
              <button
                key={t}
                onClick={() => setTargetCards(t)}
                className={`h-9 w-12 rounded-lg text-sm font-semibold transition-colors ${
                  targetCards === t
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <Button
          className="w-full !py-4 text-base"
          disabled={!canStart}
          onClick={() =>
            onStart(names, {
              useTokens,
              startingTokens: 2,
              targetCards,
              deck,
            })
          }
        >
          Start game
        </Button>
        {!canStart && (
          <p className="mt-2 text-center text-xs text-white/30">Enter at least two players.</p>
        )}
      </div>
    </div>
  );
}
