import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Der Katalog wird unter /katalog/ ausgeliefert (siehe tools/build-site.mjs).
export default defineConfig({
  base: '/katalog/',
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
