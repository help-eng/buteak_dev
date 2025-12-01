/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Buteak brand colors
                'buteak-primary': '#0B3C49',
                'buteak-gold': '#D4A437',

                // Material Design Dark Theme
                'dark-bg': '#121212',
                'dark-surface': '#1E1E1E',
                'dark-surface-1': '#222222',
                'dark-surface-2': '#272727',
                'dark-surface-3': '#2C2C2C',
                'dark-surface-4': '#313131',
                'dark-primary': '#BB86FC',
                'dark-secondary': '#03DAC6',
                'dark-error': '#CF6679',
            },
            animation: {
                'fadeIn': 'fadeIn 0.5s ease-in-out',
                'slideUp': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(187, 134, 252, 0.5)' },
                    '50%': { boxShadow: '0 0 30px rgba(187, 134, 252, 0.8)' },
                },
            },
            boxShadow: {
                'elevation-1': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                'elevation-2': '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
                'elevation-3': '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
                'elevation-4': '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
            },
        },
    },
    plugins: [],
};
