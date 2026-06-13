/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        stake: {
          bg: "#131313", // Deep canvas/header background
          card: "#201F1F", // Updated to match exact Figma card background fill (0.125, 0.121, 0.121)
          accent: "#ABD600", // Updated to match exact Figma lime action fill (0.671, 0.839, 0)
          muted: "#C4C9AC", // Muted description / navigation link text
          dangerText: "#FFB4AB", // Specialized high-contrast destruction/logout link text
          textLight: "#E5E2E1",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
