import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globalSetup: ["tests/global-setup.ts"],
    setupFiles: ["tests/setup.ts"],
    fileParallelism: false,
    // Testes de API rodam no Node; os de componentes (*.test.tsx) no jsdom.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
