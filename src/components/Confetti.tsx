import { useMemo } from 'react';
import { createPortal } from 'react-dom';

/**
 * A one-shot burst of falling confetti, used to celebrate a correct placement or a win.
 * Pieces are pure-CSS animated (see .confetti-piece in index.css) and removed under
 * prefers-reduced-motion. Render it conditionally; remount (via `key`) to replay.
 *
 * Rendered through a portal to <body> so it escapes the screen wrapper, which animates a
 * `transform` on every transition. A transformed ancestor becomes the containing block for
 * `position: fixed` children, pulling the whole burst into the parent's animating layer and
 * making it stutter then snap ("freeze then release") when that transform settles.
 */
export function Confetti({ count = 80 }: { count?: number }) {
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

  return createPortal(
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
    </div>,
    document.body,
  );
}
