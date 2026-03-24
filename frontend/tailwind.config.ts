export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4f2d7f',
          foreground: '#ffffff',
        },
        dark: '#2b144d',
        accent: {
          DEFAULT: '#a06dff',
          foreground: '#ffffff',
        },
        'bg-warm': '#f2f0ee',
        'bg-mid': '#e0dcd7',
        'bg-muted': '#ccc4bd',
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
        'input': '10px',
        'md': '10px',
        'panel': '20px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.06)',
        'sidebar': '2px 0 12px rgba(0,0,0,0.06)',
        'modal': '0 8px 40px rgba(43,20,77,0.15)',
        'dropdown': '0 4px 20px rgba(0,0,0,0.10)',
        'focus': '0 0 0 3px rgba(160,109,255,0.25)',
        'elevated': '0 4px 24px rgba(43,20,77,0.12)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

