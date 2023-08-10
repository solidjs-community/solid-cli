import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { handleAdd } from "../src/command_handlers/add";
import { readFile as readFile1 } from "fs";
const readFile = async (path: string): Promise<string> => {
	return await new Promise((res) =>
		// Can't use readFile from fs/promises because we've mocked it
		readFile1(path, (_, data) => res(data.toString())),
	);
};
const removeWhitespace = (str: string) => str.replace(/\s/g, "");
let writes: Record<string, string> = {};
vi.mock("fs/promises", () => {
	return {
		readFile: async (name: string) => {
			if (name === "vite.config.ts") {
				const sampleConfig: string = await readFile("./packages/core/tests/assets/sample_vite_config.txt");
				return sampleConfig;
			}
			return "{}";
		},
		writeFile: async (name: string, contents: string) => {
			writes[name] = contents;
		},
	};
});
vi.mock("execa", () => {
	return { $: async () => ({ stdout: "" }) };
});
vi.mock("../src/lib/utils/helpers.ts", () => {
	return {
		getViteConfig: async (): Promise<string> => new Promise((r) => r("vite.config.ts")),
		fileExists: (path: string) => {
			return path.includes("vite_config") || path.includes("root.tsx") || path.includes("index.tsx");
		},
		getRootFile: () => {
			return "./src/root.tsx";
		},
	};
});
describe("Update config", () => {
	afterEach(() => {
		writes = {};
	});
	it("Adds a plugin properly to the config", async () => {
		await handleAdd(["unocss"]);
		const newConfig = writes["vite.config.ts"];
		const expected = await readFile("./packages/core/tests/assets/sample_unocss_result.txt");

		expect(removeWhitespace(expected)).toBe(removeWhitespace(newConfig));
	});
});
