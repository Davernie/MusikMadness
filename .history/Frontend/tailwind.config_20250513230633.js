/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['All Round Gothic', 'sans-serif'],
        crashbow: ['Crashbow', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'streak': 'streak 20s linear infinite',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'floatStreak': 'floatStreak 10s ease-in-out infinite',
        'pulseStreak': 'pulseStreak 8s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        streak: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatStreak: {
          '0%': { transform: 'translateY(0) rotate(var(--streak-rotation))' },
          '25%': { transform: 'translateY(30px) rotate(var(--streak-rotation))' },
          '50%': { transform: 'translateY(0) rotate(var(--streak-rotation))' },
          '75%': { transform: 'translateY(-30px) rotate(var(--streak-rotation))' },
          '100%': { transform: 'translateY(0) rotate(var(--streak-rotation))' },
        },
        pulseStreak: {
          '0%': { opacity: 'var(--streak-opacity)', width: 'var(--streak-width)', boxShadow: '0 0 10px var(--streak-color)' },
          '50%': { opacity: 'calc(var(--streak-opacity) * 1.5)', width: 'calc(var(--streak-width) * 1.2)', boxShadow: '0 0 20px var(--streak-color)' },
          '100%': { opacity: 'var(--streak-opacity)', width: 'var(--streak-width)', boxShadow: '0 0 10px var(--streak-color)' },
        },
      },
    },
  },
  plugins: [],
};