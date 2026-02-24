import { downloadRepo } from "./utils/download-repo";
import { join } from "path";
import { writeFileSync } from "fs";
import { handleTSConversion } from "./utils/ts-conversion";
import { GIT_IGNORE, StartTemplate } from "./utils/constants";
export type CreateStartArgs = {
	template: StartTemplate;
	destination: string;
};

export const createStartTS = ({ template, destination }: CreateStartArgs) => {
	return downloadRepo({
		repo: { owner: "solidjs", name: "templates", subdir: `solid-start/${template}` },
		dest: destination,
	});
};

export const createStartJS = async ({ template, destination }: CreateStartArgs) => {
	// Create typescript project in `<destination>/.project`
	// then transpile this to javascript and clean up
	const tempDir = join(destination, ".project");
	await createStartTS({ template, destination: tempDir });
	await handleTSConversion(tempDir, destination);
	// Add .gitignore
	writeFileSync(join(destination, ".gitignore"), GIT_IGNORE);
};

export const createStart = (args: CreateStartArgs, transpile?: boolean) => {
	if (transpile) {
		return createStartJS(args);
	}
	return createStartTS(args);
};
