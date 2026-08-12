import { join } from "node:path";
import { existsSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { handleTSConversion } from "./utils/ts-conversion";
import { GIT_IGNORE, JS_CONFIG_SOLID_V2, SolidV2Template } from "./utils/constants";
import { downloadTemplate } from "./utils/download";
import { applySsrFlip } from "./utils/ssr-flip";

export type CreateSolidV2Args = {
	template: SolidV2Template | (string & {});
	destination: string;
	/** Subdir prefix inside the templates repo (from templates.json), defaults to "solid-v2" */
	path?: string;
};

export const createSolidV2 = (args: CreateSolidV2Args, transpile?: boolean, ssr?: boolean) => {
	if (transpile) {
		return createSolidV2JS(args, ssr);
	}
	return createSolidV2TS(args, ssr);
};

export const createSolidV2TS = async ({ template, destination, path = "solid-v2" }: CreateSolidV2Args, ssr?: boolean) => {
	await downloadTemplate(`${path}/${template}`, destination);
	if (ssr) await applySsrFlip(destination);
};

/**
 * Retarget `.ts`/`.tsx` filename mentions in converted text (vite config,
 * README) to the transpiled `.js`/`.jsx` output. `.d.ts` files are deleted
 * (not transpiled) by the conversion, so their mentions are left alone.
 */
export const retargetTSFilenames = (text: string) =>
	text
		.replace(/\.tsx\b/g, ".jsx")
		.replace(/(?<!\.d)\.ts(?=[`'"])/g, ".js")
		// The blanket `.tsx` rewrite leaves duplicates behind when an array lists
		// both (`extensions: ['.jsx', '.tsx']` → `['.jsx', '.jsx']`) — dedupe.
		.replace(/extensions:\s*\[([^\]]*)\]/g, (_match, entries: string) => {
			const deduped = [...new Set(entries.split(",").map((entry) => entry.trim()).filter(Boolean))];
			return `extensions: [${deduped.join(", ")}]`;
		});

export const createSolidV2JS = async (args: CreateSolidV2Args, ssr?: boolean) => {
	// Create typescript project in `<destination>/.project`
	// then transpile this to javascript and clean up.
	// The SSR flip runs inside the temp dir, before conversion, so the config
	// edit happens on the `.ts` source (server.js is already plain JS).
	const tempDir = join(args.destination, ".project");
	await createSolidV2TS({ ...args, destination: tempDir }, ssr);
	await handleTSConversion(tempDir, args.destination, JS_CONFIG_SOLID_V2);
	// Solid 2.0 templates have no `index.html` (turnkey entries), but their vite
	// config and README reference `.ts`/`.tsx` files (setup files, comments,
	// route examples) — retarget those to the transpiled `.js`/`.jsx` output
	for (const file of ["vite.config.js", "README.md"]) {
		const filePath = join(args.destination, file);
		if (existsSync(filePath)) {
			await writeFile(filePath, retargetTSFilenames((await readFile(filePath)).toString()));
		}
	}
	// Add .gitignore
	writeFileSync(join(args.destination, ".gitignore"), GIT_IGNORE);
};
