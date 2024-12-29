import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-soft": {
          200: "#E5E7EB",
        },
        "information": {
          base: "#3B82F6",
        },
        "error": {
          base: "#EF4444",
        },
        "warning": {
          base: "#F97316",
        },
        "success": {
          base: "#22C55E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
