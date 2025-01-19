import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { createVanilla } from "../src"
import { cwd } from "process";
import { existsSync, readdir, readdirSync, readFileSync } from "fs";
import { rm } from "fs/promises";
it("downloads and extracts the typescript template", async () => {
    await createVanilla({ template: "ts", destination: "./test/ts" }, false)

    const appTsx = existsSync("./test/ts/src/App.tsx");
    expect(appTsx).toBe(true);
})