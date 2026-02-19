import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        equalizer: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        equalizerSlow: {
          "0%, 100%": { transform: "scaleY(0.6)" },
          "50%": { transform: "scaleY(0.8)" },
        },
      },
      animation: {
        equalizer: "equalizer 0.6s ease-in-out infinite",
        equalizerSlow: "equalizerSlow 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
