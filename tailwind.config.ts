import type { Config } from "tailwindcss";
import { colors, shadows, radius, fonts } from "./lib/tokens";

// Les valeurs viennent de lib/tokens.ts — ne jamais les redéfinir ici.
const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors,
      boxShadow: shadows,
      borderRadius: radius,
      fontFamily: {
        sans: [...fonts.sans],
        display: [...fonts.display],
        mono: [...fonts.mono],
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "fade-up": "fade-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
