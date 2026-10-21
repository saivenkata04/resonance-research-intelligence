import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        resonance: {
          bg: "#F5F7FA",
          header: "#101827",
          sidebar: "#172235",
          accent: "#36C9C0",
          accentHover: "#2db4ac",
          text: "#101827",
          secondary: "#64748B",
          card: "#FFFFFF",
          border: "#DCE4EE",
          warning: "#F59E0B",
          conflict: "#F43F5E",
          success: "#34D399",
          hoverSidebar: "#1e2c44",
          blue: {
            DEFAULT: "#3B6FD8",
            hover: "#2F5CB8",
            light: "#EBF2FE",
            dark: "#1E3A8A",
          },
          navy: {
            950: "#0B101B",
            900: "#101827",
            800: "#172235",
            700: "#1e2c44",
          },
          muted: "#CBD5E1",
          teal: {
            DEFAULT: "#36C9C0",
            hover: "#2db4ac",
            light: "#E6FAF8",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(16, 24, 39, 0.05), 0 1px 2px 0 rgba(16, 24, 39, 0.03)",
        card: "0 4px 6px -1px rgba(16, 24, 39, 0.04), 0 2px 4px -1px rgba(16, 24, 39, 0.02)",
        drawer: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
