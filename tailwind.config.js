/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#124E66",
        "brand-dark": "#0D3748",
        rose: "#D45D79",
        success: "#16724C",
        warning: "#76440B",
        danger: "#9F2323",
        surface: "#F8F9FA",
        ink: "#1E1E24",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
