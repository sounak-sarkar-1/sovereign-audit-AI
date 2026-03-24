/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f2d7f",
          foreground: "#ffffff",
        },
        dark: "#2b144d",
        accent: {
          DEFAULT: "#a06dff",
          foreground: "#ffffff",
        },
        "bg-warm": "#f2f0ee",
        "bg-mid": "#e0dcd7",
        "bg-muted": "#ccc4bd",
      },
    },
  },
  plugins: [],
}

