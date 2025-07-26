// postcss.config.js
// This file configures PostCSS, a tool that processes CSS files.
// Tailwind CSS uses PostCSS to transform its utility classes into final CSS.
export default {
  plugins: {
    tailwindcss: {}, // This plugin integrates Tailwind CSS into PostCSS
    autoprefixer: {}, // This plugin automatically adds vendor prefixes (like -webkit-) to CSS rules for better browser compatibility
  },
};