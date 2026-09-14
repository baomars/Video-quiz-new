/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
    "./remotion/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', '"Noto Sans"', 'sans-serif'],
        vietnam: ['"Be Vietnam Pro"', '"Noto Sans"', 'sans-serif'],
        noto: ['"Noto Sans"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
