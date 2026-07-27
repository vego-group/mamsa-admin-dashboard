import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — Mamsa forest green
        sidebar: {
          DEFAULT: '#15291F',
          hover: '#1D3628',
          active: '#24402F',
          border: '#24402F',
          muted: '#7C9689',
        },
        brand: {
          DEFAULT: '#1E4034',
          hover: '#183429',
          soft: '#E7EFEA',
          rail: '#8FBFA6',
        },
        accent: {
          DEFAULT: '#E8590C',
          soft: '#FDEBE0',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          page: '#F7F8F7',
          muted: '#F2F4F3',
        },
        hairline: '#E8EBE9',
        // Status palette — the single source of truth for StatusBadge
        status: {
          green: '#16A34A',
          greenSoft: '#E7F6EC',
          sage: '#5F8D74',
          sageSoft: '#EBF2ED',
          amber: '#D97706',
          amberSoft: '#FDF3E3',
          red: '#DC2626',
          redSoft: '#FDECEC',
          grey: '#6B7280',
          greySoft: '#F1F2F4',
          blue: '#2563EB',
          blueSoft: '#EAF0FE',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 32, 24, 0.04), 0 1px 3px rgba(16, 32, 24, 0.03)',
        pop: '0 8px 30px rgba(16, 32, 24, 0.12)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-plex-ar)', 'var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in-end': {
          from: { transform: 'translateX(var(--slide-from, 100%))' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-in-end': 'slide-in-end 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
