import type { HTMLAttributes, ReactNode } from 'react';

const variantClasses: Record<'solid' | 'frosted' | 'tinted', string> = {
  solid: 'border-surface-outline/60 bg-surface-raised/95 text-text-primary',
  frosted: 'frosted-panel border-white/10 text-text-primary',
  tinted: 'border-white/15 bg-white/5 text-white',
};

type CardSurfaceProps = {
  children: ReactNode;
  variant?: 'solid' | 'frosted' | 'tinted';
  className?: string;
} & HTMLAttributes<HTMLElement>;

export function CardSurface({
  children,
  variant = 'solid',
  className = '',
  ...props
}: CardSurfaceProps) {
  const variantClass = variantClasses[variant] ?? variantClasses.solid;
  const composedClassName =
    `w-full rounded-[28px] border p-space-lg shadow-card ${variantClass} ${className}`.trim();
  return (
    <article className={composedClassName} {...props}>
      {children}
    </article>
  );
}
