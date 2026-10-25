import { copyFile } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts"],
  external: ["react", "react-window", /\.css$/],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  minify: true,
  outDir: "dist",
  clean: true,
  injectStyle: true,
  // Required for Next.js App Router; added after minify so it isn't stripped
  banner: { js: '"use client";' },
  // CSS is external, so the built JS imports "./style.css"; copy it next to it
  onSuccess: async () => {
    await copyFile("src/style.css", "dist/style.css");
  },
});
