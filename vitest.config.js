import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Zwei Testumgebungen in einem Lauf:
//   apps/demo  → jsdom, JSX, Testing Library
//   tools/     → Node, kein DOM nötig
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: 'demo',
          globals: true,
          environment: 'jsdom',
          include: ['apps/demo/**/*.test.{js,jsx}'],
          setupFiles: ['./tools/test-setup.js'],
        },
      },
      {
        test: {
          name: 'mock',
          globals: true,
          environment: 'node',
          include: ['tools/**/*.test.mjs'],
        },
      },
    ],
  },
});
