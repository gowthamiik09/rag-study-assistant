import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sora)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        brand: {
          50: "#f0eeff",
          100: "#e0dcff",
          200: "#c4bcff",
          300: "#a292ff",
          400: "#8b78ff",
          500: "#7c6dfa",
          600: "#6355e8",
          700: "#4f46d4",
          800: "#3d36a8",
          900: "#2d2780",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.2s ease forwards",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
