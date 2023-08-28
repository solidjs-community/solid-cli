import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	target: "esnext",
	format: ["esm", "cjs"],
	splitting: false,
	sourcemap: true,
	minify: true,
	clean: true,
});
