import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        // Category colors
        "cat-0": "hsl(var(--cat-0))",
        "cat-0-bg": "hsl(var(--cat-0-bg))",
        "cat-1": "hsl(var(--cat-1))",
        "cat-1-bg": "hsl(var(--cat-1-bg))",
        "cat-2": "hsl(var(--cat-2))",
        "cat-2-bg": "hsl(var(--cat-2-bg))",
        "cat-3": "hsl(var(--cat-3))",
        "cat-3-bg": "hsl(var(--cat-3-bg))",
        "cat-4": "hsl(var(--cat-4))",
        "cat-4-bg": "hsl(var(--cat-4-bg))",
        "cat-5": "hsl(var(--cat-5))",
        "cat-5-bg": "hsl(var(--cat-5-bg))",
      },
      fontFamily: {
        display: ["Caveat", "cursive"],
        body: ["Montserrat", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
