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
			name: "app.config.ts",
			contents: `import { defineConfig } from "@solidjs/start/config";
            // Simulates an app config
            export default defineConfig({
                vite: {
                  plugins: [solid()]
                }
            });
            `,
		};
		const expected = `import examplePlugin from "example";
        import { defineConfig } from "@solidjs/start/config";
        // Simulates an app config
        export default defineConfig({
            vite: {
              plugins: [
                  solid(),
                  examplePlugin({})
              ]
            }
        });`;
		const result = await transformPlugins([examplePlugin], config);

		expect(removeWhitespace(result)).toBe(removeWhitespace(expected));
	});
});
