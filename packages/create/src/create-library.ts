import { downloadRepo, GithubFetcher } from "@begit/core";

export type CreateLibraryArgs = {
	destination: string;
};
export const createLibrary = ({ destination }: CreateLibraryArgs) => {
	return downloadRepo(
		{
			repo: { owner: "solidjs-community", name: "solid-lib-starter" },
			dest: destination,
		},
		GithubFetcher,
	);
};
