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
    },
  },
  plugins: [],
};
export default config;
