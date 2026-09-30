import animate from 'tailwindcss-animate';
/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: { extend: { screens: { xs: '480px' } } },
  plugins: [animate],
};

export default config;
