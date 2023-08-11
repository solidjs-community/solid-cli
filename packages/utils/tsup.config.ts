import { defineConfig } from "tsup";
import metaUrlPlugin from "@chialab/esbuild-plugin-meta-url";

export default defineConfig({
	entry: ["src/index.ts", "src/paths/index.ts", "src/transform/index.ts"],
	target: "esnext",
	format: ["esm", "cjs"],
	splitting: false,
	sourcemap: true,
	clean: true,
	esbuildPlugins: [metaUrlPlugin()],
});
