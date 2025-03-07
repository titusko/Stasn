/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-orbitron)'],
        cyber: ['var(--font-space-grotesk)'],
      },
      colors: {
        'cyber-dark': '#000000',
        'cyber-blue': '#0ea5e9',
        'cyber-purple': '#a855f7',
        'cyber-pink': '#ec4899',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(14, 165, 233, 0.5)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
      backgroundImage: {
        'gradient-cyber': 'radial-gradient(circle at center, rgba(236, 72, 153, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
      },
    },
  },
  plugins: [],
}; 