/** @type {import('tailwindcss').Config} */
export default {
  content: ["{srcDir}/**/*.{vue,js,jsx,mjs,ts,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: "#DD8B41",
        "primary-light": "#ffeede",
        secondary: "#10819E",
        black: "#1e1e1e",
      },
    },
  },
  plugins: [],
  prefix: "tw-",
}
