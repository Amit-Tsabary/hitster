import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'token';

const styles: Record<Variant, string> = {
  primary:
    'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none',
  ghost: 'bg-white/5 hover:bg-white/10 text-white ring-1 ring-white/15',
  danger: 'bg-rose-600/90 hover:bg-rose-500 text-white',
  token:
    'bg-amber-400/15 hover:bg-amber-400/25 text-amber-200 ring-1 ring-amber-400/30 disabled:opacity-40 disabled:hover:bg-amber-400/15',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}
