/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0A0A0B',
                foreground: '#F2F2F2',
                surface: {
                    DEFAULT: '#161618',
                    hover: '#1D1D20',
                },
                accent: {
                    gold: '#C5A059',
                    emerald: '#10B981',
                },
                border: '#27272A',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                premium: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
                'glass-gold': '0 0 15px -3px rgba(197, 160, 89, 0.2)',
            },
        },
    },
    plugins: [],
};
