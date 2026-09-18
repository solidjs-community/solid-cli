import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { log } from "@clack/prompts";

/**
 * Flips a client-mode Solid 2.0 template (e.g. `solid-v2/basic`) into streaming SSR.
 * The delta to the `solid-v2/fullstack` template's server posture is exactly two files:
 * 1. `vite.config.ts` — turn `solid({ start: true, ... })` into
 *    `solid({ start: { node: true }, ssr: true, ... })`. `start.node` makes the plugin
 *    emit a production Node entry at `dist/server/node.js` (static assets + `handleRequest`),
 *    so no hand-written server file is needed.
 * 2. `package.json` — point the `start` script at that emitted entry
 */

export const SSR_ANCHOR = "solid({ start: true";
export const SSR_ANCHOR_REPLACEMENT = "solid({ start: { node: true }, ssr: true";
/** The template documents the flip with this hint; drop it once the flip is applied */
export const SSR_HINT_COMMENT = " // add `ssr: true, start: { node: true }` for streaming SSR";
/**
 * `--env-file-if-exists` stays: the emitted entry does not read `.env` itself and the
 * templates' local flow (`cp .env.example .env` → `npm start`) relies on it.
 */
export const SSR_START_SCRIPT = "node --env-file-if-exists=.env dist/server/node.js";

/**
 * Applies the SSR flip to a scaffolded template directory (before any TS→JS conversion,
 * so the config edit happens on the `.ts` source).
 *
 * If the `vite.config.ts` anchor is missing (template drifted), the flip is aborted
 * with a warning instead of writing a broken config, leaving a working client-mode app.
 */
export const applySsrFlip = async (dir: string): Promise<boolean> => {
	const viteConfigPath = join(dir, "vite.config.ts");
	const abort = (reason: string) => {
		log.warn(`Skipping SSR setup: ${reason}. The project was created in client mode.`);
		return false;
	};
	if (!existsSync(viteConfigPath)) return abort("no vite.config.ts found");
	const viteConfig = (await readFile(viteConfigPath)).toString();
	if (!viteConfig.includes(SSR_ANCHOR)) return abort("unrecognized vite.config.ts");

	await writeFile(viteConfigPath, viteConfig.replace(SSR_ANCHOR, SSR_ANCHOR_REPLACEMENT).replace(SSR_HINT_COMMENT, ""));

	const packageJsonPath = join(dir, "package.json");
	const packageJson = JSON.parse((await readFile(packageJsonPath)).toString());
	packageJson.scripts = { ...packageJson.scripts, start: SSR_START_SCRIPT };
	await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
	return true;
};
