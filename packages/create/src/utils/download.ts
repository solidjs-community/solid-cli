import { downloadRepo, GithubFetcher } from "@begit/core";

export const TEMPLATES_REPO = { owner: "solidjs", name: "templates" } as const;

/** A slow commit lookup must not hold up a scaffold — it is only there to enable caching */
const LATEST_COMMIT_TIMEOUT_MS = 2000;

/**
 * Resolves HEAD of the templates repo to a commit sha, so begit can key its
 * tarball cache on it and reuse the download across scaffolds.
 *
 * This goes through api.github.com, which is rate limited to 60 requests/hour
 * for unauthenticated users (the archive endpoint the tarball itself comes from
 * is not). Every failure — rate limited, offline, timeout, unexpected payload —
 * resolves to `undefined`, and the caller falls back to fetching HEAD directly.
 */
export const latestTemplatesCommit = async (): Promise<string | undefined> => {
	const lookup = (async () => {
		try {
			return await GithubFetcher.fetchLatestCommit(TEMPLATES_REPO);
		} catch {
			return undefined;
		}
	})();
	let timer: ReturnType<typeof setTimeout>;
	const timeout = new Promise<undefined>((resolve) => {
		timer = setTimeout(() => resolve(undefined), LATEST_COMMIT_TIMEOUT_MS);
	});
	return Promise.race([lookup, timeout]).finally(() => clearTimeout(timer));
};

/**
 * Downloads `subdir` of the solidjs/templates repo into `destination`.
 *
 * No ref is pinned: scaffolds always come from live HEAD of the default branch,
 * matching the `templates.json` manifest, so template updates reach users
 * without a CLI release. HEAD is resolved to a sha first so begit can cache the
 * tarball under it and skip the download next time; when that lookup fails we
 * fetch HEAD directly instead, uncached — slower, but never a broken scaffold.
 */
export const downloadTemplate = async (subdir: string, destination: string) => {
	const hash = await latestTemplatesCommit();
	return downloadRepo(
		{
			repo: { ...TEMPLATES_REPO, subdir, hash },
			dest: destination,
			// HEAD is already resolved (or deliberately left unresolved) above, so begit
			// must not call the API itself. Without a sha there is nothing to key a cache
			// entry on, so the tarball is discarded rather than left behind unkeyed.
			opts: { cache: !!hash, fetch_latest_commit: false },
		},
		GithubFetcher,
	);
};
