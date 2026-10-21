/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        dark: {
          bg: '#0B0F19',
          card: '#111827',
          surface: '#1F2937',
          border: '#374151'
        },
        nature: {
          cream: '#F4EFEA',
          card: '#FAF7F2',
          surface: '#FAF8F5',
          border: '#E5DFD6',
          forest: {
            DEFAULT: '#234233',
            dark: '#1A3326',
            light: '#2E4D3C',
            text: '#1E362A',
            muted: '#5C6B64',
            lightmuted: '#8A9992',
          },
          sage: {
            light: '#E2EBE0',
            DEFAULT: '#98B294',
            dark: '#769671',
          },
          terracotta: {
            light: '#FAEDE7',
            DEFAULT: '#D27D56',
            hover: '#BF6E48',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
