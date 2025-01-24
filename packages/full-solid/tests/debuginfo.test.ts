import { expect, it } from "vitest";
import { fetchDebugInfo, prettyPrint } from "../src/debug";

it("Runs", async () => {
	const output = prettyPrint(await fetchDebugInfo());

	expect(output).contains("Runtime", "System");
});
