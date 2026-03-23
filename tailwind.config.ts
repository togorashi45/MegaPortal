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
        terracotta: "var(--terracotta)",
        darkgreen: "var(--dark-green)",
        gold: "var(--gold)",
        beige: "var(--beige)",
        bgPrimary: "var(--bg-primary)",
        bgSurface: "var(--bg-surface)",
        bgElevated: "var(--bg-elevated)",
        borderSubtle: "var(--border)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        pulseBadge: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        pulseBadge: 'pulseBadge 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
};
export default config;
