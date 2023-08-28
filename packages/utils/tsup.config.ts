import { defineConfig } from "tsup";
import metaUrlPlugin from "@chialab/esbuild-plugin-meta-url";

export default defineConfig({
	entry: ["src"],
	target: "esnext",
	format: ["esm", "cjs"],
	splitting: false,
	sourcemap: true,
	clean: true,
	minify: true,
	esbuildPlugins: [metaUrlPlugin()],
});
