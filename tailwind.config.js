/** @type {import('tailwindcss').Config} */
tailwind.config = {
  content: [
    "./*.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a5276', // 深蓝色
        secondary: '#3498db', // 亮蓝色
        accent: '#f4d03f', // 明黄色
        neutral: '#f4f9fd', // 浅灰蓝色背景
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}