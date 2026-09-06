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
          900: '#050816', // Main command center background
          850: '#080d24',
          800: '#0c1334',
          700: '#152152',
          600: '#1d2e6e',
        },
        thermal: {
          light: '#fb923c',
          DEFAULT: '#F97316', // Orange for thermal hotspots
          dark: '#ea580c',
          glow: 'rgba(249, 115, 22, 0.4)',
        },
        ai: {
          light: '#3b82f6',
          DEFAULT: '#2563EB', // Blue for AI & technology
          dark: '#1d4ed8',
          glow: 'rgba(37, 99, 235, 0.4)',
        },
        geo: {
          light: '#22c55e',
          DEFAULT: '#16A34A', // Green for geospatial/environment
          dark: '#15803d',
          glow: 'rgba(22, 163, 74, 0.4)',
        },
        critical: {
          light: '#ef4444',
          DEFAULT: '#DC2626', // Red for high-risk alerts
          dark: '#b91c1c',
          glow: 'rgba(220, 38, 38, 0.4)',
        },
        cyber: {
          cyan: '#06b6d4',
          amber: '#f59e0b',
          purple: '#8b5cf6',
          border: 'rgba(255, 255, 255, 0.08)',
          card: 'rgba(12, 19, 52, 0.65)',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'thermal-glow': '0 0 25px rgba(249, 115, 22, 0.35)',
        'ai-glow': '0 0 25px rgba(37, 99, 235, 0.35)',
        'geo-glow': '0 0 25px rgba(22, 163, 74, 0.35)',
        'critical-glow': '0 0 30px rgba(220, 38, 38, 0.45)',
        'cyber-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
