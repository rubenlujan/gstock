import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    proxy: {
      '/api/GStock': {
        target: 'https://hrg7408-001-site1.jtempurl.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
