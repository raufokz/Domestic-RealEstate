import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A2647",
          50: "#E8EDF4",
          100: "#D1DBE9",
          200: "#A3B7D3",
          300: "#7593BD",
          400: "#476FA7",
          500: "#0A2647",
          600: "#081F3A",
          700: "#06172C",
          800: "#040F1E",
          900: "#020810",
          950: "#010408",
        },
        gold: {
          DEFAULT: "#C9A227",
          50: "#FBF6E4",
          100: "#F7EDC9",
          200: "#EFDB93",
          300: "#E7C95D",
          400: "#D4B43F",
          500: "#C9A227",
          600: "#A1821F",
          700: "#796117",
          800: "#514110",
          900: "#282008",
          950: "#141004",
        },
        burgundy: {
          DEFAULT: "#8B1E3F",
          50: "#F5E6ED",
          100: "#EBCCDB",
          200: "#D799B7",
          300: "#C36693",
          400: "#A63363",
          500: "#8B1E3F",
          600: "#6F1832",
          700: "#531226",
          800: "#380C19",
          900: "#1C060D",
          950: "#0E0306",
        },
        slate: {
          DEFAULT: "#64748B",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      maxWidth: {
        container: "1280px",
      },
      borderRadius: {
        card: "20px",
        button: "12px",
      },
      boxShadow: {
        premium: "0 4px 24px -4px rgba(10, 38, 71, 0.12)",
        "premium-lg": "0 8px 40px -8px rgba(10, 38, 71, 0.18)",
        "premium-xl": "0 16px 64px -12px rgba(10, 38, 71, 0.24)",
        gold: "0 4px 24px -4px rgba(201, 162, 39, 0.3)",
        "gold-lg": "0 8px 40px -8px rgba(201, 162, 39, 0.4)",
        glass: "0 8px 32px 0 rgba(10, 38, 71, 0.08)",
        navy: "0 4px 24px -4px rgba(10, 38, 71, 0.25)",
        card: "0 2px 16px -2px rgba(10, 38, 71, 0.08)",
        "card-hover": "0 8px 32px -4px rgba(10, 38, 71, 0.15)",
      },
      backgroundImage: {
        "gradient-navy": "linear-gradient(135deg, #0A2647 0%, #0F3460 50%, #1A4A7A 100%)",
        "gradient-gold": "linear-gradient(135deg, #C9A227 0%, #D4B43F 50%, #E7C95D 100%)",
        "gradient-premium": "linear-gradient(135deg, #0A2647 0%, #1A4A7A 100%)",
        "gradient-gold-subtle": "linear-gradient(135deg, #FBF6E4 0%, #F7EDC9 100%)",
        "gradient-hero": "linear-gradient(160deg, #0A2647 0%, #0F3460 40%, #1A4A7A 70%, #0A2647 100%)",
        "gradient-radial-gold": "radial-gradient(ellipse at center, rgba(201,162,39,0.15) 0%, transparent 70%)",
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out forwards",
        slideUp: "slideUp 0.6s ease-out forwards",
        slideDown: "slideDown 0.4s ease-out forwards",
        scaleIn: "scaleIn 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 162, 39, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(201, 162, 39, 0)" },
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};

export default config;
