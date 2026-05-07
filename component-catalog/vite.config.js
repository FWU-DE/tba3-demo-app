import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      '/groups': 'http://localhost:8000',
      '/schools': 'http://localhost:8000',
      '/states': 'http://localhost:8000',
    },
  },
});
