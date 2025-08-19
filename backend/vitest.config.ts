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
      enabled: true,
      provider: 'v8',
      reporter: ['text'],
      exclude: ['**/node_modules/**', '**/tests/**'],
    },
    silent: false,
    reporters: ['default'],
  },
});

// Test Settings

// globals: true → Lets you use describe, it, expect etc. without importing them.

// testTimeout: 60000 → Each test can run up to 60 seconds before failing.

// hookTimeout: 30000 → beforeAll, afterAll, etc. can run up to 30 seconds.

// setupFiles: ['test/setup.ts'] → Runs this file before all tests (e.g. to set up DB, mocks).

// isolate: true → Each test file runs in its own isolated environment (no leaking state).

// 📊 Coverage

// coverage.reporter → Generates coverage in text, JSON, and HTML formats.

// coverage.exclude → Ignores coverage for node_modules and tests folders.

// 📢 Output

// silent: false → Show logs during test run (not fully silent).

// reporters: ['default'] → Use the standard test reporter (you could add others like junit, etc.).
