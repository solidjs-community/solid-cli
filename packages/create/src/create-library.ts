import { downloadRepo, GithubFetcher } from "@begit/core";
import { updatePackageJsonName } from "./utils/package-name";

export type CreateLibraryArgs = {
	destination: string;
};
export const createLibrary = async ({ destination }: CreateLibraryArgs) => {
	await downloadRepo(
		{
			repo: { owner: "solidjs-community", name: "solid-lib-starter" },
			dest: destination,
		},
		GithubFetcher,
	);
	await updatePackageJsonName(destination);
};
