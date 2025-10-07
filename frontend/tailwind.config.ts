import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { brand: { 900:'#0a0a0a',700:'#1f2937',500:'#6b7280',300:'#d1d5db',50:'#f9fafb' } } } },
  plugins: []
} satisfies Config
