import { beforeEach, expect, it, vi } from "vitest";
import { createVanilla } from "../src"
import { vol, fs } from 'memfs'
import { cwd } from "process";
import { readdir, readdirSync, readFileSync } from "fs";
import { toTreeSync } from "memfs/lib/print";
vi.mock("node:fs");
vi.mock("node:fs/promises")
vi.mock("fs");
vi.mock("fs/promises")
beforeEach(() => {
    // reset the state of in-memory fs
    vol.reset()
})
it("downloads and extracts the typescript template", async () => {
    const res = await createVanilla({ template: "ts", destination: "test/ts" }, false)
    
    // const res = readdirSync(cwd());
    // console.log(res);
    console.log(toTreeSync(fs))
})