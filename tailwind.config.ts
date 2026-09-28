import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#fffefb",
        ink:    "#201515",
        accent: "#ff4f00",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
