/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          'button-blue': '#4096ff'
        }
      },
    },
    corePlugins: {
      preflight: false,
    },
    plugins: [],
  }