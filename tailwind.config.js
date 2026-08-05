const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        deepBlack: '#050505',
        burgundy: '#5A0E1E',
        wine: '#7B1F2A',
        slateMuted: '#2B2F34',
        ash: '#6D7075',
        goldAccent: '#C9A66B',
        silverAccent: '#A7A9AC',
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
