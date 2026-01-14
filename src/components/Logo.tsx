import { forwardRef, useId } from 'react';

type LogoProps = {
  variant?: 'mark' | 'wordmark';
  size?: number;
  title?: string;
};

function buildMark(size: number, title: string | undefined, gradientId: string, waveId: string) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient
          id={gradientId}
          x1="4"
          y1="4"
          x2="60"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#57CFFF" />
          <stop offset="1" stopColor="#FFC996" />
        </linearGradient>
        <linearGradient id={waveId} x1="12" y1="36" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gradientId})`} />
      <circle cx="44" cy="18" r="8" fill="rgba(255,255,255,0.85)" />
      <path
        d="M12 40C18 35 25 35 31 39C37 43 43 43 52 38V50C43 55 37 55 31 51C25 47 18 47 12 52V40Z"
        fill={`url(#${waveId})`}
      />
    </svg>
  );
}

export const Logo = forwardRef<HTMLDivElement, LogoProps>(function Logo(
  { variant = 'wordmark', size = 40, title = 'Vibe Weather' },
  ref,
) {
  const gradientId = useId();
  const waveId = useId();
  const mark = buildMark(size, title, gradientId, waveId);
  if (variant === 'mark') {
    return mark;
  }

  return (
    <div ref={ref} className="flex items-center gap-space-2xs" role="img" aria-label={title}>
      {mark}
      <div className="leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-text-muted">Vibe</p>
        <p className="font-display text-lg text-text-primary">Weather</p>
      </div>
    </div>
  );
});
