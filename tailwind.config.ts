import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      white: '#ffffff',
      background: '#fafaf8',
      foreground: '#1a1a18',
      safe: '#22c55e',
      caution: '#f59e0b',
      'high-risk': '#ef4444',
      border: '#e5e5e3',
      muted: '#737370',
    },
    extend: {},
  },
  plugins: [],
}

export default config
