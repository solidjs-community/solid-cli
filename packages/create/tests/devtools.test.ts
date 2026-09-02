import { runCommand } from "citty";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addDevDependency } from "../src/utils/dev-deps";
import { START_DEVTOOLS_PACKAGE, START_DEVTOOLS_VERSION } from "../src/utils/constants";

const { confirm, createSolidV2 } = vi.hoisted(() => ({
	confirm: vi.fn(),
	createSolidV2: vi.fn(),
}));

vi.mock("@clack/prompts", async (importOriginal) => ({
	...(await importOriginal<typeof import("@clack/prompts")>()),
	confirm,
}));

vi.mock("../src/create-solid-v2", async (importOriginal) => ({
	...(await importOriginal<typeof import("../src/create-solid-v2")>()),
	createSolidV2,
}));

import { createSolid } from "../src";

const TEMPLATE_PKG = {
	name: "example-basic",
	devDependencies: { "typescript": "^5.9.2", "vite": "^8.1.5" },
	dependencies: { "solid-js": "^2.0.0-rc.0" },
};

let projectDir: string;
beforeEach(() => {
	// Unroutable address: fetchTemplatesManifest fails fast and falls back to the
	// baked-in template lists, same trick used in manifest.test.ts / cli.test.ts.
	process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL = "http://127.0.0.1:1/templates.json";
	projectDir = join(mkdtempSync(join(tmpdir(), "solid-cli-devtools-")), "app");
	// Stand in for the template download: just materialize a package.json
	createSolidV2.mockImplementation(async ({ destination }: { destination: string }) => {
		mkdirSync(destination, { recursive: true });
		writeFileSync(join(destination, "package.json"), JSON.stringify(TEMPLATE_PKG, null, 2) + "\n");
	});
});
afterEach(() => {
	delete process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL;
	rmSync(join(projectDir, ".."), { recursive: true, force: true });
	vi.clearAllMocks();
});

const readPkg = () => JSON.parse(readFileSync(join(projectDir, "package.json")).toString());

it("prompts for start-devtools on Solid 2.0 projects and adds it on yes", async () => {
	confirm.mockResolvedValueOnce(true);

	// --ssr answers the SSR toggle up front, so the only confirm left is devtools
	await runCommand(createSolid("test"), { rawArgs: [projectDir, "basic", "--solid", "--ts", "--ssr"] });

	expect(confirm).toHaveBeenCalledTimes(1);
	expect(confirm.mock.calls[0][0].message).toContain(START_DEVTOOLS_PACKAGE);
	expect(readPkg().devDependencies[START_DEVTOOLS_PACKAGE]).toBe(START_DEVTOOLS_VERSION);
});

it("leaves the project untouched when the devtools prompt is declined", async () => {
	confirm.mockResolvedValueOnce(false);

	await runCommand(createSolid("test"), { rawArgs: [projectDir, "basic", "--solid", "--ts", "--ssr"] });

	expect(readPkg().devDependencies[START_DEVTOOLS_PACKAGE]).toBeUndefined();
});

it("skips the prompt when --devtools is passed", async () => {
	await runCommand(createSolid("test"), { rawArgs: [projectDir, "basic", "--solid", "--ts", "--ssr", "--devtools"] });

	expect(confirm).not.toHaveBeenCalled();
	expect(readPkg().devDependencies[START_DEVTOOLS_PACKAGE]).toBe(START_DEVTOOLS_VERSION);
});

it("keeps devDependencies alphabetized and preserves the template's formatting", async () => {
	mkdirSync(projectDir, { recursive: true });
	writeFileSync(join(projectDir, "package.json"), JSON.stringify(TEMPLATE_PKG, null, 2) + "\n");

	await addDevDependency(projectDir, START_DEVTOOLS_PACKAGE, START_DEVTOOLS_VERSION);

	const raw = readFileSync(join(projectDir, "package.json")).toString();
	expect(raw.endsWith("\n")).toBe(true);
	expect(raw).toContain('  "devDependencies"');
	expect(Object.keys(readPkg().devDependencies)).toEqual([START_DEVTOOLS_PACKAGE, "typescript", "vite"]);
});
