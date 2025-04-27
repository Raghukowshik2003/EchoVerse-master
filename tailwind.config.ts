import type { Config } from "tailwindcss";
const svgToDataUri = require("mini-svg-data-uri");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/preline/dist/*.js",
  ],
  theme: {
    extend: {
      // --- Existing Colors & Ring ---
      colors: {
        border: "#E5E7EB",
        background: "#ffffff",
        foreground: "#000000",
        ring: "#3b82f6", // Added ring color (blue-500)
      },
      ringColor: {
        DEFAULT: "#3b82f6", // Ensures ring color works properly
      },
      // --- Existing Background Images ---
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // --- >>> Added Keyframes & Animation <<< ---
      keyframes: {
        moveDot: {
          '0%, 100%': { // Top-Right
            // --- Adjust vertical offset ---
            top: 'calc(10% - 2px)', // Changed from -2.5px
            right: 'calc(10% - 2.5px)', // Horizontal offset likely okay
            left: 'auto'
          },
          '25%': { // Top-Left
            // --- Adjust vertical offset ---
            top: 'calc(10% - 2px)', // Changed from -2.5px
            left: 'calc(10% - 2.5px)',
            right: 'auto'
          },
          '50%': { // Bottom-Left
            // --- Adjust vertical offset ---
            top: 'calc(90% - 2px)', // Changed from -2.5px
            left: 'calc(10% - 2.5px)',
            right: 'auto'
          },
          '75%': { // Bottom-Right
            // --- Adjust vertical offset ---
            top: 'calc(90% - 2px)', // Changed from -2.5px
            right: 'calc(10% - 2.5px)',
            left: 'auto'
          },
        },
      },
      animation: {
        moveDot: 'moveDot 6s linear infinite',
      },
      // --- >>> End Added Keyframes & Animation <<< ---
    },
  },
  plugins: [
    // --- Existing Plugins ---
    require("preline/plugin"),
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-dot": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="26" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
    function addVariablesForColors({ addBase, theme }: any) {
      let allColors = flattenColorPalette(theme("colors"));
      let newVars = Object.fromEntries(
        Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
      );

      addBase({
        ":root": newVars,
      });
    }
  ],
};

export default config;