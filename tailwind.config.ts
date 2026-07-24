import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        'purple-splash': "hsl(var(--purple-splash))",
        'deep-dark-purple': "hsl(var(--deep-dark-purple))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        health: {
          normal: "hsl(var(--health-normal))",
          borderline: "hsl(var(--health-borderline))",
          moderate: "hsl(var(--health-moderate))",
          high: "hsl(var(--health-high))",
          info: "hsl(var(--health-info))",
          na: "hsl(var(--health-na))",
        },

      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-butterfly': 'var(--gradient-butterfly)',
        'gradient-splash': 'var(--gradient-splash)',
        'gradient-button': 'var(--gradient-button)',
        'icon-glow': 'var(--icon-glow)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'card': 'var(--shadow-card)',
        'butterfly': 'var(--shadow-butterfly)',
        'glow-button': 'var(--glow-button)',
        'glow-button-hover': 'var(--glow-button-hover)',
        'glow-normal': 'var(--glow-normal)',
        'glow-borderline': 'var(--glow-borderline)',
        'glow-moderate': 'var(--glow-moderate)',
        'glow-high': 'var(--glow-high)',
        'glow-info': 'var(--glow-info)',
      },

      dropShadow: {
        'glow-butterfly': 'var(--glow-butterfly)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--transition-smooth)',
        'spring': 'var(--transition-spring)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fadeIn": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)"
          },
          "50%": {
            transform: "translateY(-10px)"
          }
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translate(0px, 0px)"
          },
          "50%": {
            transform: "translate(30px, -30px)"
          }
        },
        "float-reverse": {
          "0%, 100%": {
            transform: "translate(0px, 0px)"
          },
          "50%": {
            transform: "translate(-30px, 30px)"
          }
        },
        "wave": {
          "0%, 100%": {
            transform: "translateX(0%) translateY(0%)",
            opacity: "0.3"
          },
          "50%": {
            transform: "translateX(10%) translateY(-5%)",
            opacity: "0.5"
          }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.04)" }
        },
        "pulse-warning": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--health-high) / 0.5)" },
          "50%": { boxShadow: "0 0 0 8px hsl(var(--health-high) / 0)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fadeIn": "fadeIn 0.6s ease-out",
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 20s ease-in-out infinite",
        "float-reverse": "float-reverse 25s ease-in-out infinite",
        "wave": "wave 15s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        "pulse-warning": "pulse-warning 2s ease-out infinite",
      },

    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
