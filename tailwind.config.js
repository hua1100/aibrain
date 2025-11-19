/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 分類顏色
        work: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
        health: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        personal: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        learning: {
          DEFAULT: '#8B5CF6',
          light: '#EDE9FE',
        },
      },
      animation: {
        'bounce-once': 'bounce 0.5s ease-in-out',
        'pulse-fast': 'pulse 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};
