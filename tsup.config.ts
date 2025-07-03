// backend/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/api/index.ts" }, // ➜ dist/index.js
  format: ["cjs"],
  outDir: "dist",
  splitting: false,
  clean: true,
  dts: false            // no .d.ts = faster build
});
