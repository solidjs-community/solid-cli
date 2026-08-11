import { defineConfig } from "vitest/config";
export default defineConfig({
	test: {
		globalSetup: ["./setup.ts"],
		// "test" is where template-download tests scaffold projects;
		// the scaffolded templates carry test files of their own
		exclude: ["**/node_modules/**", "**/test/**"],
	},
});
