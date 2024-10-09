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
});
