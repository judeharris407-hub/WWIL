/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wwil: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-light': '#EFF6FF',
          'blue-50': '#EFF6FF',
          sky: '#0284C7',
          orange: '#2563EB',
          'orange-hover': '#1D4ED8',
          'orange-light': '#EFF6FF',
          'orange-50': '#EFF6FF',
          'navy-950': '#080D1A',
          'navy-900': '#0F172A',
          'navy-800': '#1E293B',
          'navy-700': '#334155',
          'navy-600': '#475569',
          'gray-50': '#F8FAFC',
          'gray-100': '#F1F5F9',
          'gray-200': '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.4)',
        'card-soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
