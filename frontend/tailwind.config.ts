// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss';

/**
 * Apple-inspired minimalist design tokens: a restrained neutral ramp, one accent,
 * generous spacing, and a subtle glass surface used for elevated panels.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f6f7',
          100: '#e9e9ec',
          200: '#d3d4d9',
          300: '#adaeb8',
          400: '#82848f',
          500: '#646672',
          600: '#4e505b',
          700: '#3f414a',
          800: '#2b2d34',
          900: '#1a1b20',
          950: '#0f1013',
        },
        accent: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec6ff',
          400: '#59a6ff',
          500: '#3184f6',
          600: '#1c66db',
          700: '#1852b1',
          800: '#1a468f',
          900: '#1b3d75',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Inter',
          'Segoe UI',
          'PingFang TC',
          'PingFang SC',
          'Microsoft JhengHei',
          'Noto Sans CJK TC',
          'sans-serif',
        ],
        mono: ['SF Mono', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(15, 16, 19, 0.04), 0 1px 3px rgba(15, 16, 19, 0.06)',
        panel: '0 8px 30px rgba(15, 16, 19, 0.08)',
      },
      backdropBlur: {
        glass: '18px',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 180ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
