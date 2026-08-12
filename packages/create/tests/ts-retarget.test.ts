import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { retargetTSFilenames } from "../src/create-solid-v2";

const fixtureConfig = fileURLToPath(new URL("./fixtures/solid-v2-basic/vite.config.ts", import.meta.url));

it("dedupes the extensions array instead of writing ['.jsx', '.jsx']", () => {
	const converted = retargetTSFilenames(readFileSync(fixtureConfig).toString());

	expect(converted).toContain("extensions: ['.jsx']");
	expect(converted).not.toContain("'.tsx'");
	expect(converted).not.toContain("'.jsx', '.jsx'");
	// Setup files are transpiled alongside the rest of the template
	expect(converted).toContain("./vitest-setup.js");
});

it("retargets filename mentions in comments and prose", () => {
	const converted = retargetTSFilenames(
		"// generates the entries around src/App.tsx\nSee `vite.config.ts` and `src/routes/users/[id].tsx`. Type declarations stay in `global.d.ts`.",
	);

	expect(converted).toContain("src/App.jsx");
	expect(converted).toContain("`vite.config.js`");
	expect(converted).toContain("[id].jsx");
	// `.d.ts` files are deleted by the conversion, not renamed
	expect(converted).toContain("global.d.ts");
});
