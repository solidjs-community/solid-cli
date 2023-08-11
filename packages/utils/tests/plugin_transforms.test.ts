import { describe, test, expect } from "vitest";
import { Config, transformPlugins } from "../src/transform";
import { PluginOptions } from "../src/transform";

const removeWhitespace = (str: string) => str.replace(/\s/g, "");
const examplePlugin: PluginOptions = {
	importName: "examplePlugin",
	importSource: "example",
	isDefault: true,
	options: {},
};
describe("transformPlugins", () => {
	test("Config is updated properly", async () => {
		const config: Config = {
			name: "vite.config.ts",
			contents: `import solid from "solid-start/vite";
            // Simulates a vite config
            export default defineConfig({
              plugins: [solid()],
            });
            `,
		};
		const expected = `import examplePlugin from "example";
        import solid from "solid-start/vite";
        // Simulates a vite config
        export default defineConfig({
            plugins: [
                solid(),
                examplePlugin({})
            ]
        });`;
		const result = await transformPlugins([examplePlugin], config);

		expect(removeWhitespace(result)).toBe(removeWhitespace(expected));
	});
});
