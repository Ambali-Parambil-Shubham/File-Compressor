/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FFF7E2',
        'surface-low': '#FAF4E8',
        'surface-container': '#F3ECE0',
        'surface-high': '#FFFFFF',
        'surface-highest': '#EDE5D6',
        primary: '#4F633D',
        'primary-hover': '#3E4F30',
        'primary-light': '#E9EFE6',
        secondary: '#8BA194',
        'secondary-light': '#F0F5F2',
        'on-surface': '#1F291C',
        'on-surface-muted': '#556353',
        'on-surface-subtle': '#829180',
        border: '#DFE7E1',
        'border-light': '#EDF2EE',
        error: '#D32F2F',
        success: '#388E3C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(31, 41, 28, 0.05), 0 1px 2px rgba(31, 41, 28, 0.03)',
        'card-hover': '0 8px 24px -4px rgba(31, 41, 28, 0.08), 0 2px 6px -1px rgba(31, 41, 28, 0.04)',
        'dropdown': '0 10px 30px -5px rgba(31, 41, 28, 0.12)',
        'button': '0 1px 2px rgba(31, 41, 28, 0.1)',
      },
    },
  },
  plugins: [],
}
