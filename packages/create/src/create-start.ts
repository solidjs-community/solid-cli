import { downloadRepo, GithubFetcher } from "@begit/core";
import { join } from "path";
import { writeFileSync } from "fs";
import { handleTSConversion } from "./utils/ts-conversion";
import { GIT_IGNORE, StartTemplate, StartTemplateV2 } from "./utils/constants";
export type CreateStartArgs = {
	template: StartTemplate | StartTemplateV2;
	destination: string;
};

export const createStartTS = ({ template, destination }: CreateStartArgs, v2?: boolean) => {
	const subdir = v2 ? `solid-start/v2/${template}` : `solid-start/${template}`;
	return downloadRepo(
		{
			repo: { owner: "solidjs", name: "templates", subdir },
			dest: destination,
		},
		GithubFetcher,
	);
};

export const createStartJS = async ({ template, destination }: CreateStartArgs, v2?: boolean) => {
	// Create typescript project in `<destination>/.project`
	// then transpile this to javascript and clean up
	const tempDir = join(destination, ".project");
	await createStartTS({ template, destination: tempDir }, v2);
	await handleTSConversion(tempDir, destination);
	// Add .gitignore
	writeFileSync(join(destination, ".gitignore"), GIT_IGNORE);
};

export const createStart = (args: CreateStartArgs, transpile?: boolean, v2?: boolean) => {
	if (transpile) {
		return createStartJS(args, v2);
	}
	return createStartTS(args, v2);
};
