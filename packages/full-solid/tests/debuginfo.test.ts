import { it } from "vitest";
import { fetchDebugInfo, prettyPrint } from "../src/debug";

it("Runs", async () => {
	console.log(prettyPrint(await fetchDebugInfo()));
});
