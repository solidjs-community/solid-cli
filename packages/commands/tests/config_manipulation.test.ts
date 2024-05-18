import { describe, expect, it, vi } from "vitest";
import { handleAdd } from "../src/handlers/add";
import { readFile as readFile1 } from "fs";
import { UPDATESQUEUE } from "../../utils/src/updates";

const readFile = async (path: string): Promise<string> => {
	return await new Promise((res) =>
		// Can't use readFile from fs/promises because we've mocked it
		readFile1(path, (_, data) => res(data.toString())),
	);
};
const removeWhitespace = (str: string) => str.replace(/\s/g, "");
vi.mock("fs/promises", () => {
	return {
		readFile: async (name: string) => {
			if (name === "app.config.ts") {
				const sampleConfig: string = await readFile("./packages/commands/tests/assets/sample_vite_config.txt");
				return sampleConfig;
			}
			return "{}";
		},
		writeFile: async (_, contents: string) => {
			return contents;
		},
	};
});
vi.mock("execa", () => {
	return { $: async () => ({ stdout: "" }) };
});

vi.mock("@clack/prompts", async () => {
	const actual: object = await vi.importActual("@clack/prompts");
	return {
		...actual,
		confirm: async ({ message }: { message: string }) => true,
	};
});

vi.mock("@solid-cli/utils/updates", async () => {
	const actual: object = await vi.importActual("@solid-cli/utils/updates");
	return {
		...actual,
		clearQueue: async () => {},
	};
});

vi.mock("../src/lib/utils/helpers.ts", async () => {
	return {
		getConfigFile: async (): Promise<string> => new Promise((r) => r("app.config.ts")),
		fileExists: (path: string) => path.includes("app_config") || path.includes("app.tsx") || path.includes("index.tsx"),
		getRootFile: async (): Promise<string> => new Promise((r) => r("./src/app.tsx")),
	};
});
describe("Update config", () => {
	it(
		"Adds a plugin properly to the config",
		async () => {
			await handleAdd(["unocss"]);

			const expected = await readFile("./packages/commands/tests/assets/sample_unocss_result.txt");
			// @ts-ignore
			const newConfig = UPDATESQUEUE.find((u) => u.name === "app.config.ts")?.contents;
			expect(removeWhitespace(expected)).toBe(removeWhitespace(newConfig));
		},
		{ timeout: 50000 },
	);
});
