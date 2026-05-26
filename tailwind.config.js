/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#E8921A',
          light: '#FFF3E0',
        },
        green: {
          DEFAULT: '#2D5A27',
        },
        bg: {
          DEFAULT: '#FAF5EE',
        },
        card: {
          DEFAULT: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E5D5C5',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
