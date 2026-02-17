import type { Config } from "tailwindcss";

export default {
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
        'green-900': "var(--green-900)",
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        'sans-display': ['var(--font-space-grotesk)'],
        'Inconsolata': ['var(--font-inconsolata)'],
        'dance': ['var(--font-dancing)'],
        'montserrat': ['var(--font-montserrat)'],
      },
    },
  },
  plugins: [

  ],
} satisfies Config;


