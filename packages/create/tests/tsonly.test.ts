import { runCommand } from "citty";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { CreateSolidV2Args } from "../src/create-solid-v2";

const { autocomplete, confirm, logInfo, createSolidV2 } = vi.hoisted(() => ({
	autocomplete: vi.fn(),
	confirm: vi.fn(),
	logInfo: vi.fn(),
	createSolidV2: vi.fn(),
}));

vi.mock("@clack/prompts", async (importOriginal) => {
	const original = await importOriginal<typeof import("@clack/prompts")>();
	return {
		...original,
		autocomplete,
		confirm,
		log: { ...original.log, info: logInfo },
	};
});

// The scaffold itself (network download + conversion) is covered by template.test.ts;
// here only the prompt flow and the transpile flag passed down are under test.
vi.mock("../src/create-solid-v2", async (importOriginal) => ({
	...(await importOriginal<typeof import("../src/create-solid-v2")>()),
	createSolidV2,
}));

import { createSolid } from "../src";

const destinations: string[] = [];
const scratch = (name: string) => {
	const destination = join("test", name);
	rmSync(destination, { recursive: true, force: true });
	destinations.push(destination);
	return destination;
};

beforeEach(() => {
	// Unroutable manifest URL: falls back to the baked-in lists, so these tests
	// also assert the baked with-tsrx entry carries the tsOnly flag
	process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL = "http://127.0.0.1:1/templates.json";
	// The command writes .gitignore into the destination after scaffolding
	createSolidV2.mockImplementation(async ({ destination }: CreateSolidV2Args) =>
		mkdirSync(destination, { recursive: true }),
	);
});

afterEach(() => {
	delete process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL;
	vi.clearAllMocks();
	for (const destination of destinations.splice(0)) rmSync(destination, { recursive: true, force: true });
});

const transpileArg = () => createSolidV2.mock.calls[0][1];
const noticeCalls = () => logInfo.mock.calls.filter(([message]) => /TypeScript-only/.test(String(message)));

it("skips the TypeScript prompt when a tsOnly template is passed as an argument", async () => {
	const destination = scratch("tsonly-arg");

	await runCommand(createSolid("test"), { rawArgs: [destination, "--solid", "-t", "with-tsrx"] });

	expect(confirm).not.toHaveBeenCalled();
	expect(createSolidV2).toHaveBeenCalledOnce();
	expect(transpileArg()).toBeFalsy();
});

it("prints a notice and scaffolds TypeScript when --js is passed for a tsOnly template", async () => {
	const destination = scratch("tsonly-js-flag");

	await runCommand(createSolid("test"), { rawArgs: [destination, "--solid", "-t", "with-tsrx", "--js"] });

	expect(confirm).not.toHaveBeenCalled();
	expect(noticeCalls()).toHaveLength(1);
	expect(noticeCalls()[0][0]).toContain("with-tsrx");
	expect(transpileArg()).toBeFalsy();
});

it("forces TypeScript when a tsOnly template is picked interactively after choosing JavaScript", async () => {
	const destination = scratch("tsonly-interactive");
	autocomplete.mockResolvedValueOnce("with-tsrx");

	await runCommand(createSolid("test"), { rawArgs: [destination, "--solid", "--js"] });

	expect(noticeCalls()).toHaveLength(1);
	expect(transpileArg()).toBeFalsy();
});

it("leaves non-tsOnly templates unaffected: --js still converts and no notice is printed", async () => {
	const destination = scratch("tsonly-unaffected-js");

	await runCommand(createSolid("test"), { rawArgs: [destination, "--solid", "-t", "bare", "--js"] });

	expect(noticeCalls()).toHaveLength(0);
	expect(transpileArg()).toBe(true);
});

it("leaves non-tsOnly templates unaffected: the TypeScript prompt is still offered", async () => {
	const destination = scratch("tsonly-unaffected-prompt");
	confirm.mockResolvedValueOnce(true); // "Use Typescript?" -> yes

	await runCommand(createSolid("test"), { rawArgs: [destination, "--solid", "-t", "bare"] });

	expect(confirm).toHaveBeenCalledWith({ message: "Use Typescript?" });
	expect(transpileArg()).toBeFalsy();
});
