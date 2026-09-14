import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Drei Testumgebungen in einem Lauf:
//   apps/demo      → jsdom, JSX, Testing Library
//   tools/         → Node, kein DOM nötig
//   apps/beispiele → Node, statischer Bereich ohne Build
//   apps/shared    → jsdom, gemeinsame Sprachwahl
//   apps/katalog   → Node, Textschlüssel des Katalogs
//   packages/      → jsdom, die Bausteine in allen drei Fassungen
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
          name: 'beispiele',
          globals: true,
          environment: 'node',
          include: ['apps/beispiele/**/*.test.mjs'],
        },
      },
      {
        test: {
          name: 'katalog',
          globals: true,
          environment: 'node',
          include: ['apps/katalog/**/*.test.mjs'],
        },
      },
      {
        test: {
          name: 'shared',
          globals: true,
          environment: 'jsdom',
          // apps/portal: der Zuordnungstest lädt die Custom Elements und
          // braucht deshalb ein DOM.
          include: ['apps/shared/**/*.test.mjs', 'apps/portal/**/*.test.mjs'],
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
      {
        // jsdom, weil die Web-Component-Fassung customElements und Shadow DOM
        // braucht; Vue und React werden hier serverseitig gerendert.
        test: {
          name: 'bausteine',
          globals: true,
          environment: 'jsdom',
          include: ['packages/**/*.test.{js,jsx,mjs}'],
        },
      },
    ],
  },
});
