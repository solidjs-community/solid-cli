import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	target: "esnext",
	format: "esm",
	splitting: false,
	bundle: true,
	sourcemap: true,
	clean: true,
	noExternal: ["@solid-cli/commands"],
	treeshake: true,
	minify: true,
	banner: {
		js: `import { createRequire } from "module";
		const require = createRequire(import.meta.url);`,
	},
});
