/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This 'content' array tells Tailwind CSS which files to scan for its utility classes.
    // Tailwind will only generate CSS for the classes it finds in these files, keeping your final CSS file small.
    "./index.html", // Your main HTML file that Vite uses.
    "./src/**/*.{js,ts,jsx,tsx}", // All JavaScript, TypeScript, JSX, and TSX files inside the 'src' folder
                                  // These are typically where your React components are located.
  ],
  theme: {
    extend: {
      // The 'extend' property allows you to customize and add to Tailwind's default theme.
      // For example, you could define custom color palettes, font families, spacing, etc., here.
      // For now, it's empty, meaning we use Tailwind's defaults.
    },
  },
  plugins: [
    // This array is for adding Tailwind CSS plugins that extend its functionality.
    // For example, plugins for typography or forms. We don't need any for this basic setup.
  ],
}