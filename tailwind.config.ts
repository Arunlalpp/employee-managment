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
        base: "#080808",
        surface: "#111111",
        card: "#181818",
        border: "#242424",
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E2C06A",
          dark: "#A07830",
          muted: "#C9A84C20",
        },
        ink: {
          primary: "#F0EDE8",
          secondary: "#8A8680",
          muted: "#4A4845",
        },
        success: "#3ECF8E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#60A5FA",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseGold: { "0%,100%": { boxShadow: "0 0 0 0 rgba(201,168,76,0.3)" }, "50%": { boxShadow: "0 0 0 8px rgba(201,168,76,0)" } },
        shimmer: { "0%": { backgroundPosition: "-1000px 0" }, "100%": { backgroundPosition: "1000px 0" } },
      },
      boxShadow: {
        gold: "0 0 30px rgba(201,168,76,0.15)",
        card: "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
        elevated: "0 4px 24px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
