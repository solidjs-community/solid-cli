import { expect, it } from "vitest";
import { createVanilla } from "../src";
import { existsSync } from "fs";
it("downloads and extracts the basic template", async () => {
	await createVanilla({ template: "basic", destination: "./test/ts" }, false);

	const appTsx = existsSync("./test/ts/src/App.tsx");
	expect(appTsx).toBe(true);
});
