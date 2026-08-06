import type { Config } from "tailwindcss";
import tokens from "./design/tokens.json";

const { color, spacing, typography, radius, shadow } = tokens;

const toPx = (obj: Record<string, number>): Record<string, string> =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, `${v}px`]));

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        fontFamily: {
            sans: ["var(--font-archivo)", ...typography.fontFamily.body.slice(1)],
            display: ["var(--font-barlow-condensed)", ...typography.fontFamily.display.slice(1)],
        },
        fontSize: toPx(typography.fontSize),
        letterSpacing: typography.letterSpacing,
        borderRadius: toPx(radius),
        spacing: toPx(spacing),
        boxShadow: shadow,
        colors: {
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            card: {
                DEFAULT: "hsl(var(--card))",
                foreground: "hsl(var(--card-foreground))"
            },
            popover: {
                DEFAULT: "hsl(var(--popover))",
                foreground: "hsl(var(--popover-foreground))"
            },
            primary: {
                DEFAULT: "hsl(var(--primary))",
                foreground: "hsl(var(--primary-foreground))"
            },
            secondary: {
                DEFAULT: "hsl(var(--secondary))",
                foreground: "hsl(var(--secondary-foreground))"
            },
            muted: {
                DEFAULT: "hsl(var(--muted))",
                foreground: "hsl(var(--muted-foreground))"
            },
            accent: {
                DEFAULT: "hsl(var(--accent))",
                foreground: "hsl(var(--accent-foreground))"
            },
            destructive: {
                DEFAULT: "hsl(var(--destructive))",
                foreground: "hsl(var(--destructive-foreground))"
            },
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            chart: {
                '1': 'hsl(var(--chart-1))',
                '2': 'hsl(var(--chart-2))',
                '3': 'hsl(var(--chart-3))',
                '4': 'hsl(var(--chart-4))',
                '5': 'hsl(var(--chart-5))'
            },
            brand: color.brand,
            amber: color.amber,
            night: color.night,
            neutral: color.neutral,
            status: color.status
        }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
