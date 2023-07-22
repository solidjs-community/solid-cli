import { defineConfig } from "tsup";
import metaUrlPlugin from "@chialab/esbuild-plugin-meta-url";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "esnext",
  format: "esm",
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildPlugins: [metaUrlPlugin()],
});
