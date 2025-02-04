import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: [
        "**/node_modules/**",
        "**/vitest.config.ts",
        "**/dist/**",
        "**/index.ts",
        "**/advanced.ts",
        "**/mapped-dependency.ts",
        "**/*.type.ts",
        "**/*.interface.ts",
        "**/*.test.ts",
      ],
    },
  },
  server: {
    host: "127.0.0.1",
  },
});
