import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#FDE68A',
          DEFAULT: '#F9C11C', // アクセントカラー (10%)
          dark: '#B45309',
        },
        space: {
          950: '#05070A',
          900: '#0B0E14', // ベースカラー (60%)
        }
      },
      fontFamily: {
        display: ["var(--font-playfair)"],
        sans: ["var(--font-inter)"],
        accent: ["var(--font-oswald)"],
      },
      animation: {
        'aurora': 'aurora 20s infinite linear',
      },
      keyframes: {
        aurora: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        }
      },
    },
  },
  plugins: [],
};
export default config;