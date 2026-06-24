import { Button } from '../components/Button';
import { Timeline } from '../components/Timeline';
import type { Player, Settings } from '../state/gameTypes';
import type { AudioStatus } from '../hooks/useAudioPreview';

interface Props {
  player: Player;
  settings: Settings;
  selectedSlot: number | null;
  attemptingName: boolean;
  audio: {
    status: AudioStatus;
    play: () => void;
    pause: () => void;
    replay: () => void;
  };
  onSelectSlot: (i: number) => void;
  onToggleName: () => void;
  onConfirm: () => void;
}

export function PlacementScreen({
  player,
  settings,
  selectedSlot,
  attemptingName,
  audio,
  onSelectSlot,
  onToggleName,
  onConfirm,
}: Props) {
  const playing = audio.status === 'playing';
  return (
    <div className="flex min-h-full flex-col px-4 py-6">
      <div className="text-center">
        <div className="text-sm uppercase tracking-widest text-white/40">{player.name}</div>
        <h2 className="mt-1 text-xl font-bold">Where does this song go?</h2>
        <p className="mt-1 text-sm text-white/40">
          Tap a slot between your cards — older to the left, newer to the right.
        </p>
      </div>

      <div className="mt-2 flex justify-center">
        <button
          onClick={playing ? audio.pause : audio.replay}
          className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
        >
          {playing ? '❚❚ Pause' : '▶ Replay song'}
        </button>
      </div>

      <div className="my-auto rounded-2xl bg-white/[0.03] ring-1 ring-white/5">
        <Timeline
          timeline={player.timeline}
          selectable
          selectedSlot={selectedSlot}
          onSelectSlot={onSelectSlot}
        />
      </div>

      {settings.useTokens && (
        <label className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={onToggleName}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              attemptingName ? 'bg-amber-400' : 'bg-white/15'
            }`}
            aria-pressed={attemptingName}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                attemptingName ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
          <span className="text-sm text-white/70">
            I’ll name the title <em>and</em> artist for a bonus 🎵
          </span>
        </label>
      )}

      <div className="mt-6">
        <Button
          className="w-full !py-4 text-base"
          disabled={selectedSlot === null}
          onClick={onConfirm}
        >
          {selectedSlot === null ? 'Pick a slot' : 'Lock in placement'}
        </Button>
      </div>
    </div>
  );
}
