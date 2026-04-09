import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Game semantic colors
        win: 'var(--color-win)',
        draw: 'var(--color-draw)',
        loss: 'var(--color-loss)',
        xp: 'var(--color-xp)',
        money: 'var(--color-money)',
        promotion: 'var(--color-promotion)',
        relegation: 'var(--color-relegation)',
        // UI palette
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        title: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.25s ease-out',
        'pop-in': 'popIn 0.25s ease',
        'slide-in': 'slideIn 0.3s ease-out',
        'score-reveal': 'scoreReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'goal-flash': 'goalFlash 0.8s ease',
        'confetti-pop': 'confettiPop 0.4s ease',
      },
      keyframes: {
        fadeUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        popIn: {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '60%':  { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        scoreReveal: {
          '0%':   { transform: 'scale(0.5) translateY(20px)', opacity: '0' },
          '100%': { transform: 'scale(1)   translateY(0)',    opacity: '1' },
        },
        goalFlash: {
          '0%':   { background: 'rgba(34, 197, 94, 0)' },
          '30%':  { background: 'rgba(34, 197, 94, 0.3)' },
          '100%': { background: 'rgba(34, 197, 94, 0)' },
        },
        confettiPop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
