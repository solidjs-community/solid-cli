import { describe, expect, it, vi } from "vitest";
import { handleAdd } from "../src/command_handlers/add";
import { readFile as readFile1 } from "fs";
import { UPDATESQUEUE } from "@solid-cli/utils/updates";
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
			if (name === "vite.config.ts") {
				const sampleConfig: string = await readFile("./packages/core/tests/assets/sample_vite_config.txt");
				return sampleConfig;
			}
			return "{}";
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
	it.skip("Adds a plugin properly to the config", async () => {
		await handleAdd(["unocss"]);

		const expected = await readFile("./packages/core/tests/assets/sample_unocss_result.txt");
		// @ts-ignore
		const newConfig = UPDATESQUEUE.find((u) => u.name === "vite.config.ts")?.contents;
		expect(removeWhitespace(expected)).toBe(removeWhitespace(newConfig));
	});
});
