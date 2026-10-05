import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.ts'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0A0A0B', 900: '#050506', 800: '#0A0A0B', 700: '#141414', 600: '#1C1C1E' },
        bronze: { DEFAULT: '#B08D57', 300: '#E6D3AE', 400: '#C4A26B', 600: '#8C6B4A' },
        gold: { DEFAULT: '#D4B483', 300: '#EBD9B4', 600: '#B8955E' },
        mist: '#CFC8BC',
        white: '#F7F3EC',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        ping2: { '0%': { transform: 'scale(1)', opacity: '0.8' }, '80%,100%': { transform: 'scale(2.6)', opacity: '0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        ping2: 'ping2 1.8s cubic-bezier(0,0,0.2,1) infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
