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
        'display-lg': [
          'clamp(2.5rem, 5vw, 3.5rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        'display-md': [
          'clamp(1.75rem, 3vw, 2.5rem)',
          { lineHeight: '1.2', letterSpacing: '-0.01em' },
        ],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
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
