import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const baseConfig = defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', '**/node_modules/**', '**/dist/**', '**/tests/**', '**/*.d.ts', '**/*.config.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    reporters: ['default', 'junit'],
    outputFile: 'reports/test-report.xml',

    projects: [
      // ------------------
      // UNIT TESTS
      // ------------------
      {
        plugins: [tsconfigPaths()],
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          fileParallelism: true,
          isolate: true,
        },
      },

      // ------------------
      // INTEGRATION TESTS
      // ------------------
      {
        plugins: [tsconfigPaths()],
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          setupFiles: ['tests/helper/setup-db.ts'],
          fileParallelism: false,
          maxConcurrency: 1,
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
