import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8eaf6',
          100: '#c5cae9',
          500: '#3f51b5',
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#0d47a1',
        },
        accent: {
          400: '#ff8f00',
          500: '#ff6d00',
          600: '#e65100',
        },
        surface: '#F5F7FA',
      },
      fontFamily: {
        bengali: ['Noto Sans Bengali', 'sans-serif'],
        heading: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
