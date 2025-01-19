import { expect, it } from "vitest";
import { createVanilla } from "../src"
import { existsSync } from "fs";
it("downloads and extracts the typescript template", async () => {
    await createVanilla({ template: "ts", destination: "./test/ts" }, false)

    const appTsx = existsSync("./test/ts/src/App.tsx");
    expect(appTsx).toBe(true);
})