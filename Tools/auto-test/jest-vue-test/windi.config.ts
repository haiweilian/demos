import { defineConfig } from 'vite-plugin-windicss';

export default defineConfig({
  extract: {
    include: ['index.html', 'src/**/*.{vue,jsx,tsx,html}'],
  },
  theme: {
    extend: {
      colors: {
        dark: '#303030',
        light: '#ebebeb',
      },
    },
  },
});
