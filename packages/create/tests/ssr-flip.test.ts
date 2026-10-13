import { beforeEach, expect, it } from "vitest";
import { mkdtempSync, copyFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { applySsrFlip, SSR_ANCHOR_REPLACEMENT, SSR_HINT_COMMENT, SSR_START_SCRIPT } from "../src/utils/ssr-flip";

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
	// `start.node` makes the plugin emit the production Node entry (dist/server/node.js)
	expect(viteConfig).toContain("solid({ start: { node: true }, ssr: true, extensions: ['.jsx', '.tsx']");
	expect(viteConfig).toContain(SSR_ANCHOR_REPLACEMENT);
	expect(viteConfig).not.toContain("start: true");
	expect(viteConfig).not.toContain(SSR_HINT_COMMENT);

	const packageJson = JSON.parse(readFileSync(join(dir, "package.json")).toString());
	expect(packageJson.scripts.start).toBe(SSR_START_SCRIPT);
	expect(packageJson.scripts.start).toBe("node --env-file-if-exists=.env dist/server/node.js");
	// The other scripts are untouched
	expect(packageJson.scripts.dev).toBe("vite");
	expect(packageJson.scripts.build).toBe("vite build");

	// The flip only edits the two existing files — no hand-written server.js any more
	expect(readdirSync(dir).sort()).toEqual(["package.json", "vite.config.ts"]);
});

it("aborts without writing anything when the vite config anchor is missing", async () => {
	const drifted = `import { defineConfig } from "vite";\nexport default defineConfig({});\n`;
	writeFileSync(join(dir, "vite.config.ts"), drifted);
	const packageJsonBefore = readFileSync(join(dir, "package.json")).toString();

	expect(await applySsrFlip(dir)).toBe(false);

	expect(readFileSync(join(dir, "vite.config.ts")).toString()).toBe(drifted);
	expect(readdirSync(dir).sort()).toEqual(["package.json", "vite.config.ts"]);
	expect(readFileSync(join(dir, "package.json")).toString()).toBe(packageJsonBefore);
});

it("aborts when there is no vite.config.ts", async () => {
	expect(await applySsrFlip(mkdtempSync(join(tmpdir(), "ssr-flip-empty-")))).toBe(false);
});
