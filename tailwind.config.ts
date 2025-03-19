import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,tsx,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#204D3D",
        secondary: "#B8E0D2",
        customBlack: "#191919"
      },
    },
  },
  plugins: [],
} satisfies Config;
