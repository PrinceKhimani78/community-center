import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B2A5B",
        gold: "#C9971C",
        "light-gold": "#E2B544",
        "pale-gold": "#F4CF6A",
        "deep-gold": "#8A6510",
        cream: "#FBF6EC",
        ink: "#14213D",
        muted: "#5B6474",
        "field-border": "#E5D9BF",
        "card-border": "#EFE4CC",
        success: "#15803D",
        error: "#C62828",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        gujarati: ["var(--font-gujarati)", "'Noto Sans Gujarati'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
