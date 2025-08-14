import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 maps '@' to your 'src' folder , it is for resolving paths of files in src dir
    },
  },
  test: {
    globals: true,
    testTimeout: 60000, // Increase the timeout for individual tests
    hookTimeout: 30000, // Increase the timeout for hooks like beforeAll
    setupFiles: ['test/setup.ts'],
    isolate: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/tests/**'],
    },
    silent: false,
    reporters: ['default'],
  },
});
