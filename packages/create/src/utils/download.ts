import { downloadRepo, GithubFetcher } from "@begit/core";

export const TEMPLATES_REPO = { owner: "solidjs", name: "templates" } as const;

/**
 * Downloads `subdir` of the solidjs/templates repo into `destination`.
 *
 * No ref is pinned: scaffolds always come from live HEAD of the default branch,
 * matching the `templates.json` manifest, so template updates reach users
 * without a CLI release.
 *
 * `fetch_latest_commit` is off because resolving HEAD to a sha goes through
 * api.github.com, which is rate limited to 60 requests/hour for unauthenticated
 * users — the archive download itself is not. Without a sha there is nothing to
 * key a cache on, so caching is off too and every scaffold fetches a fresh
 * tarball, which is what tracking HEAD means.
 */
export const downloadTemplate = (subdir: string, destination: string) =>
	downloadRepo(
		{
			repo: { ...TEMPLATES_REPO, subdir },
			dest: destination,
			opts: { cache: false, fetch_latest_commit: false },
		},
		GithubFetcher,
	);
