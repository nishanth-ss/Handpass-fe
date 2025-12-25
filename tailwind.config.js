/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EBF5FF',
          100: '#E0EFFF',
          200: '#C2E0FF',
          300: '#99CCFF',
          400: '#66B2FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      backgroundImage: {
        'grid-slate-200': 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
        'grid-slate-800': 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-size': '20px 20px',
      },
      maskImage: {
        'gradient-white-bottom': 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        'gradient-white-top': 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.mask-gradient-white-bottom': {
          'mask-image': 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          '-webkit-mask-image': 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        },
        '.mask-gradient-white-top': {
          'mask-image': 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          '-webkit-mask-image': 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
