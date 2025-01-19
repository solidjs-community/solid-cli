import { downloadRepo } from "@begit/core";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { handleTSConversion } from "./utils/ts-conversion";
import { GIT_IGNORE, VanillaTemplate } from "./utils/constants";

export type CreateVanillaArgs = {
	template: VanillaTemplate;
	destination: string;
};
export const createVanilla = (args: CreateVanillaArgs, js?: boolean) => {
	if (js) {
		return createVanillaJS(args);
	}
	return createVanillaTS(args);
};
export const createVanillaTS = async ({ template, destination }: CreateVanillaArgs) => {
	return await downloadRepo({ repo: { owner: "solidjs", name: "templates", subdir: template }, dest: destination });
};

export const createVanillaJS = async ({ template, destination }: CreateVanillaArgs) => {
	// Create typescript project in `<destination>/.project`
	// then transpile this to javascript and clean up
	const tempDir = join(destination, ".project");
	await createVanillaTS({ template, destination: tempDir });
	await handleTSConversion(tempDir, destination);
	// Add .gitignore
	writeFileSync(join(destination, ".gitignore"), GIT_IGNORE);
};
