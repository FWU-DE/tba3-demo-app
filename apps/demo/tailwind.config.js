/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#4f46e5',
        'competence': {
          1: '#ef4444',  // Level I - red-500
          2: '#f97316',  // Level II - orange-500
          3: '#eab308',  // Level III - yellow-500
          4: '#22c55e',  // Level IV - green-500
          5: '#16a34a',  // Level V - green-600
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
