/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens:{
        navfix1: '1066px',
        navfix2:'1212px',
      },
      borderRadius: {
        'lg': '2.0rem',
        'xl': '3.0rem',
        'nl': '1.45rem',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        light: "color-mix(in srgb, var(--primary-color) 10%, white)",
        gray:{
          400: "#f3f4f6"
        },
      },
    },
  },

};
