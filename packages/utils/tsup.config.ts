import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src"],
	target: "esnext",
	format: ["esm", "cjs"],
	splitting: false,
	sourcemap: true,
	clean: true,
	minify: true,
});
