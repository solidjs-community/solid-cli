import { downloadRepo, GithubFetcher } from "@begit/core";

export const TEMPLATES_REPO = { owner: "solidjs", name: "templates" } as const;

/**
 * Downloads `subdir` of the solidjs/templates repo into `destination`.
 *
 * No ref is pinned: scaffolds always come from live HEAD of the default branch,
 * matching the `templates.json` manifest, so template updates reach users
 * without a CLI release.
 */
export const downloadTemplate = (subdir: string, destination: string) =>
	downloadRepo({ repo: { ...TEMPLATES_REPO, subdir }, dest: destination }, GithubFetcher);
