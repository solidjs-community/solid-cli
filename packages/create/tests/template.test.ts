import { expect, it } from "vitest";
import { createSolidV2, createVanilla } from "../src";
import { existsSync } from "fs";
it("downloads and extracts the basic template", async () => {
	await createVanilla({ template: "basic", destination: "./test/ts" }, false);

	const appTsx = existsSync("./test/ts/src/App.tsx");
	expect(appTsx).toBe(true);
});

it("downloads and extracts the solid-v2 basic template", async () => {
	await createSolidV2({ template: "basic", destination: "./test/solid-v2" }, false);

	const appTsx = existsSync("./test/solid-v2/src/App.tsx");
	expect(appTsx).toBe(true);
});
