/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro con clase
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        dark: {
          bg: {
            primary: '#141414',
            secondary: '#000000',
            card: '#1f1f1f',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a0a0a0',
          },
          border: '#303030',
        }
      },
      backgroundColor: {
        'card': 'var(--bg-card)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
      },
      borderColor: {
        'custom': 'var(--border-color)',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}