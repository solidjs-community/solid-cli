import { downloadRepo, GithubFetcher } from "@begit/core";
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
		repo: { owner: "solidjs", name: "solid-start", subdir: `examples/${template}` },
		dest: destination,
	}, GithubFetcher);
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
