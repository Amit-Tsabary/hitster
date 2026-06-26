import { motion } from 'framer-motion';
import type { Song } from '../state/gameTypes';

/** Decade-based accent color so cards feel distinct along the timeline. */
function decadeColor(year: number): string {
  const colors = [
    '#f43f5e', // 50s/60s
    '#fb923c',
    '#facc15',
    '#4ade80',
    '#22d3ee',
    '#60a5fa',
    '#a78bfa',
    '#f472b6',
  ];
  const i = Math.min(colors.length - 1, Math.max(0, Math.floor((year - 1950) / 10)));
  return colors[i];
}

export function SongCard({ song, size = 'md' }: { song: Song; size?: 'sm' | 'md' }) {
  const accent = decadeColor(song.year);
  const pad = size === 'sm' ? 'p-2 w-24' : 'p-3 w-32';
  return (
    <motion.div
      // Cards pop in when they land on a timeline.
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={`${pad} rounded-xl bg-white/5 ring-1 ring-white/10 flex flex-col items-center text-center shadow-lg`}
      style={{ borderTop: `3px solid ${accent}`, boxShadow: `0 8px 24px -12px ${accent}66` }}
    >
      <div className="text-2xl font-extrabold tracking-tight" style={{ color: accent }}>
        {song.year}
      </div>
      <div dir="auto" className="mt-1 text-xs font-semibold leading-tight line-clamp-2">
        {song.title}
      </div>
      <div dir="auto" className="mt-0.5 text-[10px] text-white/50 leading-tight line-clamp-1">
        {song.artist}
      </div>
    </motion.div>
  );
}

/** The face-down mystery card with an animated equalizer (shown to the DJ). */
export function MysteryCard({ playing }: { playing: boolean }) {
  return (
    <motion.div
      className="relative"
      // Gently bob the whole card while the song plays.
      animate={playing ? { y: [0, -8, 0] } : { y: 0 }}
      transition={{ duration: 2.4, repeat: playing ? Infinity : 0, ease: 'easeInOut' }}
    >
      {/* Breathing glow halo behind the card, only while playing. */}
      {playing && (
        <div className="glow-pulse absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl" />
      )}
      <div className="w-40 h-52 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex flex-col items-center justify-center shadow-2xl ring-1 ring-white/20">
        <div className="flex items-end gap-1.5 h-16">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="eq-bar w-2.5 rounded-full bg-white/90"
              style={{
                height: '100%',
                animationDelay: `${i * 0.12}s`,
                animationPlayState: playing ? 'running' : 'paused',
                opacity: playing ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <div className="mt-4 text-5xl font-black text-white/90">?</div>
        <div className="mt-1 text-xs uppercase tracking-widest text-white/70">Mystery song</div>
      </div>
    </motion.div>
  );
}
