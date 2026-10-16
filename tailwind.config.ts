import type { Config } from 'tailwindcss';

// Тема "Galactic Blue": цвета, шрифты, свечения и анимации
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: '#050505',
        card: '#1B2A5B',
        brand: {
          blue: '#2A2A2A',
          light: '#FFFFFF',
          purple: '#8A8A8A',
          cyan: '#E8E8E8',
        },
        ink: {
          DEFAULT: '#E2E8F0',
          muted: '#94A3B8',
        },
        success: '#10B981',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(59, 130, 246, 0.45)',
        'glow-purple': '0 0 28px rgba(168, 85, 247, 0.5)',
        'glow-cyan': '0 0 22px rgba(34, 211, 238, 0.45)',
        glass: '0 8px 32px rgba(5, 8, 25, 0.55)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2A2A2A 0%, #8A8A8A 100%)',
        'shimmer-gradient':
          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 14px rgba(59, 130, 246, 0.35)' },
          '50%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.7)' },
        },
        nebulaA: {
          '0%, 100%': { transform: 'translate3d(-10%, -5%, 0) scale(1)' },
          '50%': { transform: 'translate3d(15%, 10%, 0) scale(1.25)' },
        },
        nebulaB: {
          '0%, 100%': { transform: 'translate3d(10%, 8%, 0) scale(1.1)' },
          '50%': { transform: 'translate3d(-14%, -12%, 0) scale(0.9)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.55' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'nebula-a': 'nebulaA 28s ease-in-out infinite',
        'nebula-b': 'nebulaB 34s ease-in-out infinite',
        ripple: 'ripple 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.35s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
