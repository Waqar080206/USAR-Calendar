import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        sunken: "rgb(var(--sunken) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--ink-muted) / <alpha-value>)",
        "ink-subtle": "rgb(var(--ink-subtle) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        "brand-ink": "rgb(var(--brand-ink) / <alpha-value>)",
        "brand-soft": "rgb(var(--brand-soft) / <alpha-value>)"
      },
      fontFamily: {
        sans: [
          "Inter var",
          "Inter",
          "Segoe UI Variable Display",
          "Segoe UI",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif"
        ],
        display: [
          "Inter var",
          "Inter",
          "Segoe UI Variable Display",
          "Segoe UI",
          "-apple-system",
          "system-ui",
          "sans-serif"
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Cascadia Code", "monospace"]
      },
      boxShadow: {
        panel: "0 1px 2px rgb(var(--shadow) / 0.04), 0 12px 32px -8px rgb(var(--shadow) / 0.10)",
        lift: "0 2px 4px rgb(var(--shadow) / 0.05), 0 18px 40px -12px rgb(var(--shadow) / 0.18)",
        float: "0 4px 8px rgb(var(--shadow) / 0.06), 0 28px 60px -16px rgb(var(--shadow) / 0.24)",
        inset: "inset 0 1px 0 0 rgb(var(--highlight) / 0.6)",
        ring: "0 0 0 1px rgb(var(--line) / 1), 0 0 0 4px rgb(var(--brand) / 0.14)"
      },
      backdropBlur: {
        xs: "2px"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      keyframes: {
        "aurora-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(3%, -4%, 0) scale(1.08)" }
        },
        "sheen": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" }
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" }
        },
        "progress-stripe": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "28px 0" }
        },
        "focus-halo": {
          "0%, 100%": { boxShadow: "0 0 0 4px rgb(var(--brand) / 0.12)" },
          "50%": { boxShadow: "0 0 0 7px rgb(var(--brand) / 0.05)" }
        }
      },
      animation: {
        "aurora-drift": "aurora-drift 18s var(--ease-out-expo) infinite",
        "aurora-drift-slow": "aurora-drift 26s var(--ease-out-expo) infinite reverse",
        sheen: "sheen 2.4s var(--ease-out-expo) infinite",
        "rise-in": "rise-in 0.5s var(--ease-out-expo) both",
        "pulse-dot": "pulse-dot 2.4s ease-in-out infinite",
        "progress-stripe": "progress-stripe 1.1s linear infinite",
        "focus-halo": "focus-halo 2.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;