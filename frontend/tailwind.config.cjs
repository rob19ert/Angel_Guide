/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
            },
            animation: {
                marquee: 'marquee 60s linear infinite',
            },
            fontFamily: {
                pixel: ['MyDigitalFont']
            },
            colors: {
                'main-color': 'rgb(255,191,0)',
                'fish-brown': '#9D7F50', // Добавь свой коричневый сюда для надежности
                'glass-color': 'rgba(171, 221, 194, 0.25)',
            }
        },
    },
    plugins: [],
}