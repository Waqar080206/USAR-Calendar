import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 20px 60px rgba(20, 36, 28, 0.12)"
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(21, 36, 28, 0.06) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};

export default config;
