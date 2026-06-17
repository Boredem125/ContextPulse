/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core background layers
        'bg-0': '#0a0a0f',
        'bg-1': '#0f0f1a',
        'bg-2': '#1a1a2e',
        'bg-3': '#252540',
        // Accent colors
        'accent-blue': '#6366f1',
        'accent-purple': '#a855f7',
        'accent-cyan': '#22d3ee',
        'accent-pink': '#ec4899',
        // Semantic
        'success': '#34d399',
        'warning': '#fbbf24',
        'error': '#f87171',
        // Text
        'text-primary': '#e0e0e8',
        'text-secondary': '#8888a0',
        'text-muted': '#555570',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6366f1, #a855f7)',
        'gradient-accent-hover': 'linear-gradient(135deg, #818cf8, #c084fc)',
        'gradient-card': 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(99,102,241,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168,85,247,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(34,211,238,0.08) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 48px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
