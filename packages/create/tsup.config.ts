import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	target: "esnext",
	format: "esm",
	splitting: true,
	sourcemap: false,
	clean: true,
	treeshake: true,
	banner: {
		js: `import { createRequire } from "module";
		const require = createRequire(import.meta.url);`,
	},
});
