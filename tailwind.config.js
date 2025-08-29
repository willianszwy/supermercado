/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Jost', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif']
      },
      colors: {
        primary: {
          green: '#139469ff',
          'green-dark': '#077552ff',
          red: '#992525ff',
          'red-dark': '#700909ff',
          'red-light': '#fef2f2',
          blue: '#1f498dff',
          'blue-dark': '#06173bff'
        }
      },
      boxShadow: {
        'primary-green': '0 0 8px rgba(19, 148, 105, 0.3)',
        'primary-red': '0 0 8px rgba(153, 37, 37, 0.3)',
        'primary-blue': '0 0 8px rgba(31, 73, 141, 0.3)',
      }
    },
  },
  plugins: [],
}