import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/api/index.ts" }, // dist/index.js
  format: ["cjs"],
  sourcemap: false,
  splitting: false,
  outDir: "dist",
  clean: true
});
