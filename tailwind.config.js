/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}" , "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // LionsGeek brand palette
        brand: {
          DEFAULT: "#FDBB10", // primary accent (yellow)
          foreground: "#111111",
        },
        surface: {
          DEFAULT: "#0f1113",
          muted: "#151718",
          inverted: "#ffffff",
        },
        text: {
          primary: "#11181C",
          secondary: "#687076",
          inverted: "#ECEDEE",
        },
        accent: {
          blue: "#2e539d",
          amber: "#b09417",
          green: "#22c55e",
          red: "#ef4444",
        },
      },
      borderRadius: {
        lg: "0.75rem", // ensure rounded-lg is consistent
      },
    },
  },
  plugins: [],
}