/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08090b",
        charcoal: "#111318",
        smoke: "#1c2028",
        gold: "#d5a64c",
        goldSoft: "#f1d28a",
        teal: "#2dd4bf"
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        premium: "0 24px 80px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};
