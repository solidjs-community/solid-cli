import { downloadRepo } from "./utils/download-repo";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { handleTSConversion } from "./utils/ts-conversion";
import { GIT_IGNORE, VanillaTemplate } from "./utils/constants";

export type CreateVanillaArgs = {
	template: VanillaTemplate;
	destination: string;
};
export const createVanilla = (args: CreateVanillaArgs, transpile?: boolean) => {
	if (transpile) {
		return createVanillaJS(args);
	}
	return createVanillaTS(args);
};

export const createVanillaTS = async ({ template, destination }: CreateVanillaArgs) => {
	return await downloadRepo({
		repo: { owner: "solidjs", name: "templates", subdir: `vanilla/${template}` },
		dest: destination,
	});
};

export const createVanillaJS = async ({ template, destination }: CreateVanillaArgs) => {
	// Create typescript project in `<destination>/.project`
	// then transpile this to javascript and clean up
	const tempDir = join(destination, ".project");
	await createVanillaTS({ template, destination: tempDir });
	await handleTSConversion(tempDir, destination);
	// Replace `index.tsx` with `index.jsx` in `index.html`
	const indexPath = join(destination, "index.html");
	writeFileSync(indexPath, (await readFile(indexPath)).toString().replace("index.tsx", "index.jsx"));
	// Add .gitignore
	writeFileSync(join(destination, ".gitignore"), GIT_IGNORE);
};
