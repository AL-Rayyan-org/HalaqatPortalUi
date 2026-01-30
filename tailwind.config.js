/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            // Animation classes already defined in index.css
        },
    },
    plugins: [
        // Using inline CSS for animations instead of the plugin
    ],
}