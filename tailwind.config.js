/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#f2efff',
          '100': '#e3dcff',
          '150': '#ccc0ff',
          '200': '#b9a6ff',
          '250': '#b09aff',
          '300': '#a589ff',
          '350': '#9875ff',
          '400': '#8b5dff',
          '450': '#7e3fff',
          '500': '#7200fe',
          '550': '#6700e9',
          '600': '#5d00d3',
          '650': '#5300be',
          '700': '#4900a9',
          '750': '#3f0094',
          '800': '#35007f',
          '850': '#2b006a',
          '900': '#210056',
          '950': '#170040',
        },
        secondary: {
          '50': '#b9ffff',
          '100': '#98ffff',
          '150': '#00fafa',
          '200': '#00e9e9',
          '250': '#00d7d7',
          '300': '#00c3c3',
          '350': '#00afaf',
          '400': '#009a9a',
          '450': '#008585',
          '500': '#007070',
          '550': '#006565',
          '600': '#005b5b',
          '650': '#005050',
          '700': '#004646',
          '750': '#003c3c',
          '800': '#003232',
          '850': '#002828',
          '900': '#001e1e',
          '950': '#001414',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'system-ui', 'sans-serif'],
      },
      screens: {
        mobile: { max: '639px' },
        tablet: { min: '640px', max: '1023px' },
        desktop: { min: '1024px', max: '1279px' },
        wide: { min: '1280px' },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
