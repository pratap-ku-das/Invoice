/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        // refined indigo — deeper and less saturated than stock blue
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
      },
      borderRadius: { xl: '0.9rem', '2xl': '1.25rem' },
      boxShadow: {
        // layered: soft drop + hairline ring for crisp card edges
        card: '0 1px 2px rgba(16,24,40,0.05), 0 0 0 1px rgba(16,24,40,0.03)',
        soft: '0 4px 24px rgba(16,24,40,0.08)',
        glow: '0 0 0 1px rgba(79,70,229,0.25), 0 4px 16px rgba(79,70,229,0.25)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
        'mesh-light':
          'radial-gradient(at 20% 0%, rgba(99,102,241,0.14) 0, transparent 55%), radial-gradient(at 85% 15%, rgba(168,85,247,0.12) 0, transparent 50%), radial-gradient(at 50% 100%, rgba(56,189,248,0.10) 0, transparent 55%)',
        'mesh-dark':
          'radial-gradient(at 20% 0%, rgba(99,102,241,0.22) 0, transparent 55%), radial-gradient(at 85% 15%, rgba(168,85,247,0.16) 0, transparent 50%), radial-gradient(at 50% 100%, rgba(56,189,248,0.12) 0, transparent 55%)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: { shimmer: 'shimmer 1.5s infinite' },
    },
  },
  plugins: [],
};
