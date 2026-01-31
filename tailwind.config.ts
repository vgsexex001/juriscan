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
        primary: "#1C398E",
        "primary-hover": "#162456",
        link: "#155DFC",
        "text-dark": "#101828",
        "text-gray": "#4A5565",
        "text-label": "#364153",
        "text-input": "#0A0A0A",
        "text-muted": "#6A7282",
        border: "#D1D5DC",
        "feature-blue": "#51A2FF",
        "light-blue": "#DBEAFE",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        input: "10px",
        button: "10px",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      minHeight: {
        touch: "44px",
      },
      keyframes: {
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-down": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "slide-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-left": "slide-left 0.3s ease-out",
        "slide-right": "slide-right 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
