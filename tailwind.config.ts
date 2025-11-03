import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D87D4A',
        'primary-light': '#FBAF85',
        dark: '#101010',
        'dark-light': '#4C4C4C',
        light: '#F1F1F1',
        'light-alt': '#FAFAFA',
      },
      fontFamily: {
        sans: ['var(--font-cabin)', 'Cabin', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['56px', { lineHeight: '58px', letterSpacing: '2px' }],
        'h2': ['40px', { lineHeight: '44px', letterSpacing: '1.5px' }],
        'h3': ['32px', { lineHeight: '36px', letterSpacing: '1.15px' }],
        'h4': ['28px', { lineHeight: '38px', letterSpacing: '2px' }],
        'h5': ['24px', { lineHeight: '33px', letterSpacing: '1.7px' }],
        'h6': ['18px', { lineHeight: '24px', letterSpacing: '1.3px' }],
        'body': ['15px', { lineHeight: '25px' }],
        'overline': ['14px', { lineHeight: '19px', letterSpacing: '10px' }],
        'subtitle': ['13px', { lineHeight: '25px', letterSpacing: '1px' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config

