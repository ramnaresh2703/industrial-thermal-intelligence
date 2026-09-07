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
        space: {
          950: '#03050c',
          900: '#050816',
          850: '#080d24',
          800: '#0c1334',
          750: '#111a42',
          700: '#152152',
          600: '#1d2e6e',
        },
        thermal: {
          light: '#fb923c',
          DEFAULT: '#F97316',
          dark: '#ea580c',
          glow: 'rgba(249, 115, 22, 0.4)',
        },
        ai: {
          light: '#3b82f6',
          DEFAULT: '#2563EB',
          dark: '#1d4ed8',
          glow: 'rgba(37, 99, 235, 0.4)',
        },
        geo: {
          light: '#22c55e',
          DEFAULT: '#16A34A',
          dark: '#15803d',
          glow: 'rgba(22, 163, 74, 0.4)',
        },
        critical: {
          light: '#ef4444',
          DEFAULT: '#DC2626',
          dark: '#b91c1c',
          glow: 'rgba(220, 38, 38, 0.4)',
        },
        cyber: {
          cyan: '#06b6d4',
          amber: '#f59e0b',
          purple: '#8b5cf6',
          pink: '#ec4899',
          border: 'rgba(255, 255, 255, 0.07)',
          card: 'rgba(8, 13, 40, 0.72)',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'thermal-glow':  '0 0 28px rgba(249, 115, 22, 0.38)',
        'thermal-glow-lg': '0 0 50px rgba(249, 115, 22, 0.45)',
        'ai-glow':       '0 0 28px rgba(37, 99, 235, 0.38)',
        'geo-glow':      '0 0 28px rgba(22, 163, 74, 0.38)',
        'critical-glow': '0 0 35px rgba(220, 38, 38, 0.50)',
        'cyan-glow':     '0 0 28px rgba(6, 182, 212, 0.38)',
        'cyber-card':    '0 8px 40px 0 rgba(0, 0, 0, 0.55)',
        'inner-glow-thermal': 'inset 0 0 20px rgba(249,115,22,0.08)',
        'inner-glow-ai': 'inset 0 0 20px rgba(37,99,235,0.08)',
        'panel': '0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'gradient-thermal':  'linear-gradient(135deg, #f97316, #ea580c, #dc2626)',
        'gradient-ai':       'linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)',
        'gradient-cyber':    'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
        'gradient-command':  'linear-gradient(180deg, #03050c 0%, #050816 50%, #080d24 100%)',
        'gradient-card':     'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, transparent 60%)',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow':     'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scanline':      'scanline 8s linear infinite',
        'radar':         'radar 4s linear infinite',
        'fade-in':       'fadeIn 0.5s ease forwards',
        'slide-up':      'slideUp 0.6s ease forwards',
        'scale-in':      'scaleIn 0.4s ease forwards',
        'shimmer':       'shimmer 2.5s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radar: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249,115,22,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(249,115,22,0.6)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'swift':     'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
