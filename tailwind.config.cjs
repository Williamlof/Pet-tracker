/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{,ts,,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      sans: ["Roboto", "sans-serif"],
    },
    scale: {
      '0': '0',
      '50': '.5',
      '75': '.75',
      '90': '.9',
      '100': '1',
      '110': '1.1',
      '125': '1.25',
      '150': '1.5',
      '200': '2',
      '300': '3',
      '400': '4',
      '500': '5',
      '600': '6',
    }, animation: {
      wiggle: 'wiggle 2s ease-in-out infinite',
    },
    keyframes: {
      wiggle: {
        '0%, 100%': { transform: 'rotate(-5deg)', scale: '600%', },
        '50%': { transform: 'rotate(5deg)', scale: '600%', },
      },
    },

  },

  plugins: [
  ],
}