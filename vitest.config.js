import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 120000, // 120s for E2E tests with real backend
    hookTimeout: 60000, // 60s for hooks (beforeEach, afterEach, etc.)
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    reporters: ['verbose', 'html']
  }
});
