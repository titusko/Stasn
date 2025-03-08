
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-dark': '#070723',
        'cyber-dark-800': '#0c0c2a',
        'cyber-dark-900': '#06061a',
        'cyber-primary': {
          DEFAULT: '#ec4899',
          400: '#f472b6',
        },
        'cyber-secondary': '#38bdf8',
        'cyber-accent': '#6366f1',
        'cyber-success': '#22c55e',
        'cyber-danger': '#ef4444',
        'cyber-warning': '#f97316',
      },
      fontFamily: {
        'cyber': ['var(--font-orbitron)', 'sans-serif'],
        'sans': ['var(--font-inter)', 'sans-serif'],
        'heading': ['var(--font-space-grotesk)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-cyber': 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.3), rgba(99, 102, 241, 0.3), rgba(0, 0, 0, 0))',
      },
    },
  },
  plugins: [],
};
