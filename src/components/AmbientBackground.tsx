/**
 * Fixed, non-interactive layer of slowly drifting aurora blobs that sits behind every screen.
 * Pure CSS animation (see .aurora-blob in index.css), so it costs nothing on the React side and
 * is disabled under prefers-reduced-motion. Keeps the existing violet/fuchsia theme.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="aurora-blob h-72 w-72 bg-violet-600/40"
        style={{ top: '-4rem', left: '-3rem', animationDelay: '0s' }}
      />
      <div
        className="aurora-blob h-80 w-80 bg-fuchsia-600/30"
        style={{ top: '20%', right: '-5rem', animationDelay: '-7s' }}
      />
      <div
        className="aurora-blob h-72 w-72 bg-indigo-600/30"
        style={{ bottom: '-5rem', left: '15%', animationDelay: '-14s' }}
      />
    </div>
  );
}
