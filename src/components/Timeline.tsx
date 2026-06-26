import { motion } from 'framer-motion';
import { SongCard } from './Card';
import type { Song } from '../state/gameTypes';

interface TimelineProps {
  timeline: Song[];
  /** When set, render clickable insertion slots and highlight the selected one. */
  selectable?: boolean;
  selectedSlot?: number | null;
  onSelectSlot?: (slotIndex: number) => void;
}

/**
 * Renders a player's timeline left→right (oldest→newest). When `selectable`, an insertion
 * slot button sits before, between, and after every card.
 */
export function Timeline({ timeline, selectable, selectedSlot, onSelectSlot }: TimelineProps) {
  const slotCount = timeline.length + 1;

  return (
    <div className="flex items-center justify-start gap-0 overflow-x-auto px-2 py-3">
      {Array.from({ length: slotCount }).map((_, i) => (
        <div key={i} className="flex items-center">
          <Slot
            i={i}
            selectable={selectable}
            active={selectedSlot === i}
            onSelectSlot={onSelectSlot}
          />
          {i < timeline.length && (
            <div className="shrink-0 px-0.5">
              <SongCard song={timeline[i]} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface SlotProps {
  i: number;
  selectable?: boolean;
  active: boolean;
  onSelectSlot?: (slotIndex: number) => void;
}

/**
 * A single insertion slot. Defined at module scope (not inside `Timeline`) so its component
 * identity is stable across renders — otherwise every re-render would remount the button and
 * interrupt its hover/tap/pulse animations.
 */
function Slot({ i, selectable, active, onSelectSlot }: SlotProps) {
  if (!selectable) return <div className="w-1" />;
  return (
    <motion.button
      onClick={() => onSelectSlot?.(i)}
      aria-label={`Place at position ${i + 1}`}
      whileTap={{ scale: 0.92 }}
      animate={active ? { scale: [1, 1.07, 1] } : { scale: 1 }}
      transition={active ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      className={`group relative mx-0.5 flex h-52 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
        active
          ? 'border-violet-400 bg-violet-500/20'
          : 'border-white/15 hover:border-violet-300/60 hover:bg-white/5'
      }`}
    >
      <span
        className={`text-2xl font-bold transition-opacity ${
          active ? 'text-violet-300 opacity-100' : 'text-white/30 opacity-60 group-hover:opacity-100'
        }`}
      >
        {active ? '▾' : '+'}
      </span>
    </motion.button>
  );
}
