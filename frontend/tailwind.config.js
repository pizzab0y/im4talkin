/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // that is animation class
      animation: {
        amfade: 'fadeOut 3s ease-in-out',
      },

      // that is actual animation
      keyframes: theme => ({
        fadeOut: {
          '0%': {
            opacity: 0,
          },
          '50%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          }
        },
      }),
    },
  },
  plugins: [],
};
