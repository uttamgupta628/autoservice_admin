/** Brand colors come from the UI design system. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { navy: '#14263D', brand: '#2677E8', success: '#19A77C', amber: '#F2A43A', cloud: '#F4F6F9' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
