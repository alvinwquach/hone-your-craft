import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/@zach.codes/react-calendar/dist/**/*/.{js,jsx,ts,tsx}",
  ],
  purge: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@zach.codes/react-calendar/dist/**/*.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

    },
    keyframes: {
      "gradient-border": {
        "0%, 100%": {
          borderColor: "transparent",
        },
        "50%": {
          borderColor: "#ff7e5f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
