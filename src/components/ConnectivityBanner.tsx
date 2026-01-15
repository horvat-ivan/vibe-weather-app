import type { ReactNode } from 'react';

type ConnectivityBannerVariant = 'offline' | 'warning';

type VariantStyles = {
  container: string;
  label: string;
  description: string;
  button: string;
};

const VARIANT_STYLES: Record<ConnectivityBannerVariant, VariantStyles> = {
  offline: {
    container:
      'bg-brand-twilight/95 border border-white/15 text-white shadow-[0_20px_45px_rgba(0,0,0,0.45)]',
    label: 'text-white/80',
    description: 'text-white/90',
    button:
      'border-white/30 text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40',
  },
  warning: {
    container:
      'bg-brand-sunrise/95 border border-brand-sunrise/50 text-[var(--color-text-inverse)] shadow-[0_20px_45px_rgba(0,0,0,0.35)]',
    label: 'text-[color:var(--color-text-inverse)] opacity-70',
    description: 'text-[color:var(--color-text-inverse)] opacity-90',
    button:
      'border-[color:rgba(5,12,31,0.35)] text-[color:var(--color-text-inverse)] hover:bg-[rgba(5,12,31,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgba(5,12,31,0.3)]',
  },
};

type ConnectivityBannerProps = {
  title: string;
  description: string | ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  variant?: ConnectivityBannerVariant;
  testId?: string;
};

export function ConnectivityBanner({
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
  variant = 'warning',
  testId,
}: ConnectivityBannerProps) {
  const { container, label, description: descriptionStyles, button } = VARIANT_STYLES[variant];

  return (
    <output
      aria-live="polite"
      data-testid={testId}
      className={`w-full rounded-2xl px-space-lg py-space-sm ${container}`}
    >
      <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-space-3xs">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.35em] ${label}`}>
            {title}
          </p>
          <p className={`text-body-sm ${descriptionStyles}`}>{description}</p>
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
            className={`inline-flex items-center justify-center rounded-full border px-space-md py-space-3xs text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-65 ${button}`}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </output>
  );
}
