import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          sunrise: 'var(--color-brand-sunrise)',
          zenith: 'var(--color-brand-zenith)',
          twilight: 'var(--color-brand-twilight)',
        },
        surface: {
          base: 'var(--color-surface-base)',
          raised: 'var(--color-surface-raised)',
          overlay: 'var(--color-surface-overlay)',
          outline: 'var(--color-surface-outline)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          warm: 'var(--color-accent-warm)',
          cool: 'var(--color-accent-cool)',
          neon: 'var(--color-accent-neon)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-2xl': [
          'clamp(3.5rem, 7vw, 4.5rem)',
          { lineHeight: '1.05', letterSpacing: '-0.03em' },
        ],
        'display-xl': ['clamp(3rem, 6vw, 4rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-lg': [
          'clamp(2.5rem, 5vw, 3.25rem)',
          { lineHeight: '1.12', letterSpacing: '-0.015em' },
        ],
        'display-md': [
          'clamp(2rem, 4vw, 2.5rem)',
          { lineHeight: '1.18', letterSpacing: '-0.01em' },
        ],
        'heading-xl': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        'heading-md': ['1.25rem', { lineHeight: '1.35' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.55' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'body-xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        eyebrow: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.45em' }],
      },
      spacing: {
        'space-3xs': '0.25rem',
        'space-2xs': '0.5rem',
        'space-xs': '0.75rem',
        'space-sm': '1rem',
        'space-md': '1.5rem',
        'space-lg': '2rem',
        'space-xl': '3rem',
        'space-2xl': '4rem',
      },
      dropShadow: {
        card: '0 25px 45px rgba(15, 23, 42, 0.25)',
      },
      borderRadius: {
        emphasis: '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
