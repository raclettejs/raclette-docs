/** @type {import('tailwindcss').Config} */
export default {
  content: ["srcDir/**/*.{vue,js,jsx,mjs,ts,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: "var(--color-brand)",
        hover: "var(--color-hover)",
        link: "var(--color-link)",
        muted: "var(--color-muted)",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
      },
    },
  },
  plugins: [],
  prefix: "tw-",
}
