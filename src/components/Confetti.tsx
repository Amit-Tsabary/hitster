import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * A one-shot burst of falling confetti, used to celebrate a correct placement or a win.
 * Render it conditionally; remount (via `key`) to replay.
 *
 * Each piece is animated with the Web Animations API using concrete transform values. This
 * matters: a CSS @keyframes animation that references a custom property (e.g. `var(--dx)`) in
 * its transform is *not* composited — it runs on the main thread and freezes whenever that
 * thread is busy (here, framer-motion's screen-entrance springs), then snaps forward to the
 * wall-clock position. Concrete WAAPI transform/opacity animations are composited, so the
 * burst stays smooth regardless of main-thread work.
 *
 * Rendered through a portal to <body> so it isn't trapped inside the screen wrapper's
 * animating transform. Disabled under prefers-reduced-motion.
 */
export function Confetti({ count = 80 }: { count?: number }) {
  const colors = ['#a78bfa', '#f472b6', '#facc15', '#4ade80', '#22d3ee', '#fb923c'];
  const containerRef = useRef<HTMLDivElement>(null);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dxFrac: (Math.random() - 0.5) * 0.4, // horizontal drift as a fraction of viewport width
        delay: Math.random() * 0.6,
        dur: 2.2 + Math.random() * 1.8,
        color: colors[i % colors.length],
        rounded: Math.random() > 0.5,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    // Resolve the fall to concrete pixels. Viewport units (vh/vw) inside an animated transform
    // keep Chrome from compositing the animation, so it runs on the main thread and freezes
    // under framer-motion's entrance work. Pixels composite reliably.
    const w = window.innerWidth;
    const h = window.innerHeight;
    const els = container.querySelectorAll<HTMLElement>('.confetti-piece');
    const animations = Array.from(els).map((el, i) => {
      const p = pieces[i];
      return el.animate(
        [
          { transform: `translate3d(0px, ${-0.1 * h}px, 0) rotateZ(0deg)`, opacity: 1 },
          { transform: `translate3d(${p.dxFrac * w}px, ${1.1 * h}px, 0) rotateZ(720deg)`, opacity: 0.9 },
        ],
        { duration: p.dur * 1000, delay: p.delay * 1000, easing: 'linear', fill: 'both' },
      );
    });
    return () => animations.forEach((a) => a.cancel());
  }, [pieces]);

  return createPortal(
    <div ref={containerRef} aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            borderRadius: p.rounded ? '9999px' : '2px',
          }}
        />
      ))}
    </div>,
    document.body,
  );
}
