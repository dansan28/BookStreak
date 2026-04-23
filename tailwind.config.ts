import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "#FAF7F2",
          50: "#FDFCFA",
          100: "#FAF7F2",
          200: "#F0E8D8",
        },
        plum: {
          DEFAULT: "#9B72CF",
          light: "#B99FE0",
          dark: "#6B4FA0",
          muted: "#7C5CBF",
        },
        rose: {
          DEFAULT: "#E8A4B8",
          light: "#F2C4D0",
          muted: "#C98AB0",
        },
        slate: {
          850: "#1E1E2E",
          900: "#15151F",
          950: "#0F0F18",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(155,114,207,0.15)",
        glow: "0 0 20px rgba(155,114,207,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
