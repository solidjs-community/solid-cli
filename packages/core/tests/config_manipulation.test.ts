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
describe("Update config", () => {
	beforeEach(() => {
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
			return {
				$: async (param: string) => {
					if (param[0] === "npm root") {
						return { stdout: "vite.config.ts" };
					}
				},
			};
		});
		vi.mock("fs", () => {
			return {
				lStatSync: () => ({ isDirectory: () => true }),
				readFile: (param: string) => {
					console.log(param);
					return "123";
				},
				existsSync: () => true,
			};
		});
	});
	afterEach(() => {
		writes = {};
		vi.clearAllMocks();
	});
	it.skip("Adds a plugin properly to the config", async () => {
		await handleAdd(["unocss"]);
		console.log("Handled");
		const newConfig = writes["vite.config.ts"];
		const expected = await readFile("./packages/core/tests/assets/sample_unocss_result.txt");

		expect(removeWhitespace(expected)).toBe(removeWhitespace(newConfig));
	});
});
