/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Refined, slightly desaturated professional palette
        primary: {
          50: '#f5f7fb',
          100: '#e8eef7',
          200: '#d4e0f0',
          300: '#b3c9e4',
          400: '#7ea6d2',
          500: '#4b84c0',
          600: '#346ba8',
          700: '#285587',
          800: '#1f456d',
          900: '#193a5c',
        },
        secondary: {
          50: '#f4f9f8',
          100: '#d9f0ec',
          200: '#b8e2dc',
          300: '#89cdc5',
          400: '#56b3aa',
          500: '#349b92',
          600: '#247a76',
          700: '#1d615f',
          800: '#184d4c',
          900: '#133f40',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
