import { describe, test, expect } from "vitest";
import { Config, transformPlugins } from "../src/transform";
import { PluginOptions } from "../src/transform";

const removeWhitespace = (str: string) => str.replace(/\s/g, "");

const makeExampleConfig = (
	plugins: string[],
	imports: string[] = [],
	functionVersion: "arrow" | "method" | "none" = "none",
) => {
	const pluginsStr = `plugins: [${plugins.join(", ")}]`;
	const viteOptionStr =
		functionVersion === "arrow"
			? // @prettier-ignore
				`
        vite: (options) => {
         return {${pluginsStr}};
        }`
			: functionVersion === "method"
				? // @prettier-ignore
					`
        vite(options) {
         return {${pluginsStr}};
        }`
				: // @prettier-ignore
					`
        vite: {
         ${pluginsStr}
        }`;

	const result =
		// @prettier-ignore
		`${imports.join("\n")}
     import { defineConfig } from "@solidjs/start/config";

     // Simulates an app config
     export default defineConfig({
        ${viteOptionStr}
      });`;

	return result;
};

const examplePlugin: PluginOptions = {
	importName: "examplePlugin",
	importSource: "example",
	isDefault: true,
	options: {},
};
describe("transformPlugins", () => {
	test("SPA config is updated properly", async () => {
		const config: Config = {
			type: "vite",
			name: "vite.config.ts",
			contents: `
       import { defineConfig } from "vite";

       // Simulates a vite config
       export default defineConfig({
plugins: []
        });
     `,
		};
		const expected = `
       import examplePlugin from "example";
       import { defineConfig } from "vite";

       // Simulates a vite config
       export default defineConfig({
        plugins: [examplePlugin({})]
       });
      `;

		const result = await transformPlugins([examplePlugin], config);

		expect(removeWhitespace(result)).toBe(removeWhitespace(expected));
	});
	test("No vite property defined config is updated properly", async () => {
		const config: Config = {
			type: "app",
			name: "app.config.ts",
			contents: `
       import { defineConfig } from "@solidjs/start/config";

       // Simulates an app config
       export default defineConfig({
        });
     `,
		};
		const expected = makeExampleConfig(["examplePlugin({})"], ['import examplePlugin from "example";']);
		const result = await transformPlugins([examplePlugin], config);

		expect(removeWhitespace(result)).toBe(removeWhitespace(expected));
	});
	test("Object config is updated properly", async () => {
		const config: Config = {
			type: "app",
			name: "app.config.ts",
			contents: makeExampleConfig(["solid()"]),
		};
		const expected = makeExampleConfig(["solid()", "examplePlugin({})"], ['import examplePlugin from "example";']);
		const result = await transformPlugins([examplePlugin], config);

		expect(removeWhitespace(result)).toBe(removeWhitespace(expected));
	});
	test("Arrow-function config is updated properly", async () => {
		const config: Config = {
			type: "app",
			name: "app.config.ts",
			contents: makeExampleConfig(["solid()"], [], "arrow"),
		};
		const expected = makeExampleConfig(
			["solid()", "examplePlugin({})"],
			['import examplePlugin from "example";'],
			"arrow",
		);
		const result = await transformPlugins([examplePlugin], config);

		expect(removeWhitespace(result)).toBe(removeWhitespace(expected));
	});

	test("Object method config is updated properly", async () => {
		const config: Config = {
			type: "app",
			name: "app.config.ts",
			contents: makeExampleConfig(["solid()"], [], "method"),
		};
		const expected = makeExampleConfig(
			["solid()", "examplePlugin({})"],
			['import examplePlugin from "example";'],
			"method",
		);
		const result = await transformPlugins([examplePlugin], config);

		expect(removeWhitespace(result)).toBe(removeWhitespace(expected));
	});
});
