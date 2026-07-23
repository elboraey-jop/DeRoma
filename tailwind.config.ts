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
          bg: "#F2D4D7",
          card: "#FFFFFF",
          lavender: "#F88379",
          lavenderCard: "#F88379",
          dark: "#005F6B",
          darkMuted: "#003E47",
          coral: "#F88379",
          coralHover: "#E56F65",
          dusty: "#F88379",
          textDark: "#005F6B",
          textMuted: "#F88379",
          border: "#F88379",
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
        'coral-glow': '0 8px 24px rgba(232, 139, 126, 0.35)',
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
