import { beforeEach, expect, it } from "vitest";
import { mkdtempSync, copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { applySsrFlip, SERVER_JS, SSR_HINT_COMMENT, SSR_START_SCRIPT } from "../src/utils/ssr-flip";

const fixtures = fileURLToPath(new URL("./fixtures/solid-v2-basic/", import.meta.url));

let dir: string;
beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "ssr-flip-"));
	copyFileSync(join(fixtures, "vite.config.ts"), join(dir, "vite.config.ts"));
	copyFileSync(join(fixtures, "package.json"), join(dir, "package.json"));
});

it("flips the basic template to streaming SSR", async () => {
	expect(await applySsrFlip(dir)).toBe(true);

	const viteConfig = readFileSync(join(dir, "vite.config.ts")).toString();
	expect(viteConfig).toContain("solid({ start: true, ssr: true");
	expect(viteConfig).not.toContain(SSR_HINT_COMMENT);

	// The production server is a verbatim copy of solid-v2/fullstack/server.js
	expect(readFileSync(join(dir, "server.js")).toString()).toBe(SERVER_JS);

	const packageJson = JSON.parse(readFileSync(join(dir, "package.json")).toString());
	expect(packageJson.scripts.start).toBe(SSR_START_SCRIPT);
	// The other scripts are untouched
	expect(packageJson.scripts.dev).toBe("vite");
	expect(packageJson.scripts.build).toBe("vite build");
});

it("aborts without writing anything when the vite config anchor is missing", async () => {
	const drifted = `import { defineConfig } from "vite";\nexport default defineConfig({});\n`;
	writeFileSync(join(dir, "vite.config.ts"), drifted);
	const packageJsonBefore = readFileSync(join(dir, "package.json")).toString();

	expect(await applySsrFlip(dir)).toBe(false);

	expect(readFileSync(join(dir, "vite.config.ts")).toString()).toBe(drifted);
	expect(existsSync(join(dir, "server.js"))).toBe(false);
	expect(readFileSync(join(dir, "package.json")).toString()).toBe(packageJsonBefore);
});

it("aborts when there is no vite.config.ts", async () => {
	expect(await applySsrFlip(mkdtempSync(join(tmpdir(), "ssr-flip-empty-")))).toBe(false);
});
