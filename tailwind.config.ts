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
        brand: {
          50:  "#eefff9",
          100: "#c6fff0",
          200: "#8dffe2",
          300: "#4dfed1",
          400: "#16f4bc",
          500: "#00d9a3",
          600: "#00b085",
          700: "#008b6b",
          800: "#006e55",
          900: "#005a46",
          950: "#003329",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      animation: {
        "gradient": "gradient 8s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          from: { boxShadow: "0 0 20px #00d9a3" },
          to: { boxShadow: "0 0 40px #00d9a3, 0 0 80px #00d9a3" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,217,163,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,163,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "50px 50px",
      },
    },
  },
  plugins: [],
};
export default config;
