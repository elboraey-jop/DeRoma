import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        aurora: {
          bg: "#FFF9EB",
          card: "#FFFFFF",
          lavender: "#D8B46A",
          lavenderCard: "#D8B46A",
          dark: "#942E3A",
          darkMuted: "#5C1C24",
          coral: "#D8B46A",
          coralHover: "#B8934A",
          dusty: "#D8B46A",
          textDark: "#942E3A",
          textMuted: "#D8B46A",
          border: "#D8B46A",
        }
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        outfit: ['var(--font-outfit)', 'sans-serif'],
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-outfit)', 'sans-serif'],
        logo: ['var(--font-playfair)', 'serif'],
        numeric: ['var(--font-numeric)', 'var(--font-outfit)', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 10px 30px rgba(35, 28, 56, 0.05)',
        'float-pill': '0 12px 32px rgba(35, 28, 56, 0.1)',
        'coral-glow': '0 8px 24px rgba(148, 46, 58, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
};
export default config;
