/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060913',
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
        },
        surface: {
          dark: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          hover: '#2A3749',
        },
        accent: {
          blue: '#2563EB',
          sky: '#38BDF8',
          cyan: '#06B6D4',
          indigo: '#6366F1',
        },
        severity: {
          minor: '#10B981',
          moderate: '#F59E0B',
          severe: '#F97316',
          fatal: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

