// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  // We are using the 'class' strategy for the dark mode.
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // As per your design prompt: deep navy/dark background
        background: '#0D1117',
        // Bright accent colors (greens/teals)
        primary: '#22c55e', // Example: Green
        'primary-hover': '#16a34a',
        accent: '#14b8a6',   // Example: Teal
        // Subtle hover highlights and borders
        'border-color': 'rgba(255, 255, 255, 0.1)',
        'hover-bg': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        // Modern font like Inter or Satoshi
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;