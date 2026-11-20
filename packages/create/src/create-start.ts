import { join } from "path";
import { writeFileSync } from "fs";
import { handleTSConversion } from "./utils/ts-conversion";
import { GIT_IGNORE, StartTemplate, StartTemplateV2 } from "./utils/constants";
import { downloadTemplate } from "./utils/download";
import { updatePackageJsonName } from "./utils/package-name";
export type CreateStartArgs = {
	template: StartTemplate | StartTemplateV2 | (string & {});
	destination: string;
	/** Subdir prefix inside the templates repo (from templates.json), defaults to "solid-start-v2"/"solid-start-v1" */
	path?: string;
};

export const createStartTS = ({ template, destination, path }: CreateStartArgs, v2?: boolean) => {
	const prefix = path ?? (v2 ? "solid-start-v2" : "solid-start-v1");
	return downloadTemplate(`${prefix}/${template}`, destination);
};

export const createStartJS = async ({ template, destination, path }: CreateStartArgs, v2?: boolean) => {
	// Create typescript project in `<destination>/.project`
	// then transpile this to javascript and clean up
	const tempDir = join(destination, ".project");
	await createStartTS({ template, destination: tempDir, path }, v2);
	await handleTSConversion(tempDir, destination);
	// Add .gitignore
	writeFileSync(join(destination, ".gitignore"), GIT_IGNORE);
};

export const createStart = async (args: CreateStartArgs, transpile?: boolean, v2?: boolean) => {
	if (transpile) {
		await createStartJS(args, v2);
	} else {
		await createStartTS(args, v2);
	}
	await updatePackageJsonName(args.destination);
};
