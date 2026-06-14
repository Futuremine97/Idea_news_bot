import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 주색: 펜 잉크 네이비
        brand: {
          50: "#eef1f7",
          100: "#d8e0ee",
          500: "#3a5285",
          600: "#243b66",
          700: "#18293f",
        },
        // 종이
        paper: {
          DEFAULT: "#f4ecd8",
          card: "#fffdf6",
          line: "#e6dcc4",
        },
        ink: "#1a2c4e",
      },
      fontFamily: {
        hand: ["Gaegu", "Caveat", "system-ui", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
