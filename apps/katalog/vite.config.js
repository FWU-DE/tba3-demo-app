import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { gemeinsameDateien } from '../shared/vite-plugin-gemeinsam.js';

// Der Katalog wird unter /katalog/ ausgeliefert (siehe tools/build-site.mjs).
export default defineConfig({
  base: '/katalog/',
  plugins: [vue(), gemeinsameDateien()],
  server: {
    port: 5174,
    proxy: {
      '/groups': 'http://localhost:8000',
      '/schools': 'http://localhost:8000',
      '/states': 'http://localhost:8000',
    },
  },
});
