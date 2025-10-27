/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'handwritten': ['Caveat', 'cursive'],
        'handwritten-bold': ['Kalam', 'cursive'],
      },
      colors: {
        'cyan-glow': '#22d3ee',
        'dark-bg': '#1a1a1a',
      },
      backgroundImage: {
        'chalkboard': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
      },
      backgroundSize: {
        'chalkboard': '20px 20px',
      },
      textShadow: {
        'glow': '0 0 10px rgba(34, 211, 238, 0.5)',
        'glow-sm': '0 0 5px rgba(34, 211, 238, 0.3)',
      }
    },
  },
  plugins: [],
}