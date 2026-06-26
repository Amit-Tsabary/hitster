import { useEffect, useMemo, useState } from 'react';

/**
 * A one-shot burst of falling confetti, used to celebrate a correct placement or a win.
 * Pieces are pure-CSS animated (see .confetti-piece in index.css) and removed under
 * prefers-reduced-motion. Render it conditionally; remount (via `key`) to replay.
 *
 * Mounting is deferred until the next frame so the burst doesn't land in the same commit as
 * the screen's entrance animation — that collision is what made the celebration stutter and
 * then jump ("freeze then release").
 */
export function Confetti({ count = 80 }: { count?: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const colors = ['#a78bfa', '#f472b6', '#facc15', '#4ade80', '#22d3ee', '#fb923c'];
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dx: `${(Math.random() - 0.5) * 40}vw`,
        delay: Math.random() * 0.6,
        dur: 2.2 + Math.random() * 1.8,
        color: colors[i % colors.length],
        rounded: Math.random() > 0.5,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count],
  );

  if (!ready) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              borderRadius: p.rounded ? '9999px' : '2px',
              '--dx': p.dx,
              '--delay': `${p.delay}s`,
              '--dur': `${p.dur}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
