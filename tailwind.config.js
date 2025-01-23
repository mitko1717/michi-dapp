/** @type {import('tailwindcss').Config} */
import {nextui} from "@nextui-org/react";

module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",

        // Or if using `src` directory:
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'secondary': '#C8AEAE',
                'custom-gray': 'rgba(72, 55, 67, 0.70)',
                'custom-dark-gray': '#252D42',
                'custom-blue': '#E2EAFF',
                'custom-blue-300': '#C3D7FF',
                'light-text': '#efdcf9',
                'subtitle': 'rgba(255, 255, 255, 0.60)',
                'border-color': '#382B35',
                'separator': '#372B35',
                'bold-blue': '#ECF1FF',
                'custom-purple': '#8751FD',
                'michi-purple': '#8952FF',
                'custom-dark-blue': '#0a0b12',
                'custom-dark-800': '#0A0B12',
                'custom-border-gray': '#3F425C',
                'custom-border-light-blue': '#3C426D',
                'white-80': 'rgba(255, 255, 255, 0.80)',
                'white-70': 'rgba(255, 255, 255, 0.70)',
                'light-gray': 'rgba(169, 192, 239, 0.80)',
            },
            boxShadow: {
                'custom': '0px 4.401px 14.304px 0px rgba(31, 24, 24, 0.77) inset',
                'leaderboard': '0px -9px 44px 0px #121429 inset',
                'custom-alt': '0px 5.827px 18.939px 0px rgba(39, 28, 32, 0.77) inset',
                'michi': '0px 3.32px 10.78px 0px #4A15BA inset',
                'navbar': '0px -9px 44px 0px #121429 inset',
            },
            backgroundImage: {
                'custom-gradient': 'linear-gradient(180deg, #0A0B12 9.92%, #0A0B12 100%)',
                'modal-gradient': 'linear-gradient(166deg, #0A0B12 30.06%, #3A2829 90.09%)',
                'custom-gradient-alt': 'linear-gradient(225deg, rgba(10, 11, 18, 0.60) 16.89%, rgba(58, 40, 41, 0.60) 79.25%)',
                'custom-leaderboard-header-gradient': 'linear-gradient(180deg, #030614 9.92%, #0F1529 100%)',
                'custom-rank-gradient': 'linear-gradient(180deg, rgba(23, 28, 46, 0.70) 9.92%, rgba(16, 21, 36, 0.70) 100%)',
                'text-gradient': 'linear-gradient(180deg, #A9C0EF 5.21%, #D0DFF9 81.77%)',
                'leaderboard-title-gradient': 'linear-gradient(0deg, #F4F4FF 0%, #CCCAF9 90.22%)',
            },
        },
    },
    darkMode: "class",
    plugins: [nextui({
        prefix: "nextui",
        addCommonColors: false,
        defaultTheme: "dark",
        defaultExtendTheme: "dark",
        layout: {},
        themes: {
            light: {
                layout: {},
                colors: {},
            },
            dark: {
                layout: {},
                colors: {
                    default: {
                        100: "#0A0B12",
                        200: "rgba(72, 55, 67, 0.70)",
                        DEFAULT: "#0A0B12"
                    },
                    primary: "#F39983",
                    secondary: "#0A0B12",
                 },
            },
        },
    }),]
}