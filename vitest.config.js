import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.spec.js", "**/*.test.js"],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 1000
  }
});
