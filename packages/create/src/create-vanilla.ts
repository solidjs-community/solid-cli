import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { handleTSConversion } from "./utils/ts-conversion";
import { GIT_IGNORE, VanillaTemplate } from "./utils/constants";
import { downloadTemplate } from "./utils/download";
import { updatePackageJsonName } from "./utils/package-name";

export type CreateVanillaArgs = {
	template: VanillaTemplate | (string & {});
	destination: string;
	/** Subdir prefix inside the templates repo (from templates.json), defaults to "vanilla" */
	path?: string;
};
export const createVanilla = async (args: CreateVanillaArgs, transpile?: boolean) => {
	if (transpile) {
		await createVanillaJS(args);
	} else {
		await createVanillaTS(args);
	}
	await updatePackageJsonName(args.destination);
};

export const createVanillaTS = async ({ template, destination, path = "vanilla" }: CreateVanillaArgs) => {
	return await downloadTemplate(`${path}/${template}`, destination);
};

export const createVanillaJS = async ({ template, destination, path }: CreateVanillaArgs) => {
	// Create typescript project in `<destination>/.project`
	// then transpile this to javascript and clean up
	const tempDir = join(destination, ".project");
	await createVanillaTS({ template, destination: tempDir, path });
	await handleTSConversion(tempDir, destination);
	// Replace `index.tsx` with `index.jsx` in `index.html`
	const indexPath = join(destination, "index.html");
	writeFileSync(indexPath, (await readFile(indexPath)).toString().replace("index.tsx", "index.jsx"));
	// Add .gitignore
	writeFileSync(join(destination, ".gitignore"), GIT_IGNORE);
};
