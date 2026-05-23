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
        terracotta: '#E07A5F',
        petroleo: '#3D5A80',
        creme: '#F8F4E3',
        cremeEscuro: '#EAE2CF'
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        lora: ['var(--font-lora)', 'serif']
      },
    },
  },
  plugins: [],
};
export default config;

