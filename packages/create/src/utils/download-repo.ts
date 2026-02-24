import { simpleGit, type SimpleGit } from "simple-git";
import { createReadStream, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { ReadableStream as WebReadableStream } from "stream/web";
import type { Fetcher, FetcherSource, Repository, Tarball, DownloadAndExtract } from "@begit/core";
import { downloadRepo as begitDownloadRepo, GithubFetcher, GitlabFetcher } from "@begit/core";

/**
 * Git host configuration
 */
type GitHostConfig = {
	source: FetcherSource;
	baseUrl: string;
};

const GIT_HOSTS: Record<FetcherSource, GitHostConfig> = {
	github: {
		source: "github",
		baseUrl: "https://github.com",
	},
	gitlab: {
		source: "gitlab",
		baseUrl: "https://gitlab.com",
	},
};

/**
 * Creates a temporary directory and returns its path
 */
const createTempDir = (): string => {
	const dir = join(tmpdir(), `solid-cli-${randomUUID()}`);
	mkdirSync(dir, { recursive: true });
	return dir;
};

/**
 * Converts a Node.js Readable stream to a Web ReadableStream
 */
const nodeStreamToWebStream = (nodeStream: Readable): WebReadableStream<Uint8Array> => {
	return new WebReadableStream({
		start(controller) {
			nodeStream.on("data", (chunk: Buffer) => {
				controller.enqueue(new Uint8Array(chunk));
			});
			nodeStream.on("end", () => {
				controller.close();
			});
			nodeStream.on("error", (err) => {
				controller.error(err);
			});
		},
		cancel() {
			nodeStream.destroy();
		},
	});
};

/**
 * Creates a Fetcher implementation for @begit/core that uses simple-git (git CLI wrapper)
 * to clone repositories and create tarballs.
 *
 * This can be used as a fallback when tarball downloads fail, or for repos
 * that don't support direct tarball downloads.
 *
 * @param source - The git host source ("github" or "gitlab")
 * @param customBaseUrl - Optional custom base URL (e.g., for self-hosted GitLab)
 */
export const createSimpleGitFetcher = (
	source: FetcherSource = "github",
	customBaseUrl?: string,
): Fetcher => {
	const config = GIT_HOSTS[source];
	const baseUrl = customBaseUrl || config.baseUrl;

	return {
		source,

		async fetchTarball(
			repo: Repository,
			metadata?: { ref?: string; auth_token?: string },
		): Promise<Tarball> {
			const git: SimpleGit = simpleGit();
			const tempDir = createTempDir();
			const tarballPath = join(tempDir, "repo.tar.gz");

			// git archive --remote doesn't work with GitHub (they don't support it)
			// So we clone the repo shallowly and create an archive locally
			const cloneDir = join(tempDir, "clone");
			const repoUrl = `${baseUrl}/${repo.owner}/${repo.name}.git`;

			// Clone with depth 1 to minimize download
			await git.clone(repoUrl, cloneDir, [
				"--depth",
				"1",
				...(repo.branch ? ["--branch", repo.branch] : []),
			]);

			// Get the commit hash for the prefix (matching GitHub/GitLab tarball format)
			const clonedGit = simpleGit(cloneDir);
			const logResult = await clonedGit.log(["-1", "--format=%H"]);
			const commitHash = logResult.latest?.hash?.substring(0, 7) || "HEAD";

			// Create gzip-compressed archive with prefix
			// GitHub/GitLab tarballs have format: owner-repo-hash/
			const prefix = `${repo.owner}-${repo.name}-${commitHash}/`;
			await clonedGit.raw([
				"archive",
				"--format=tar.gz",
				`--prefix=${prefix}`,
				"-o",
				tarballPath,
				"HEAD",
			]);

			const stream = createReadStream(tarballPath);
			const webStream = nodeStreamToWebStream(stream);

			// Clean up temp dir when stream is consumed
			stream.on("close", () => {
				rmSync(tempDir, { recursive: true, force: true });
			});

			return {
				name: `${repo.owner}-${repo.name}-${commitHash}.tar.gz`,
				body: webStream,
			};
		},

		async fetchLatestCommit(repo: Repository, auth_token?: string): Promise<string> {
			const git: SimpleGit = simpleGit();
			const repoUrl = `${baseUrl}/${repo.owner}/${repo.name}.git`;
			const ref = repo.branch || "HEAD";

			// Use ls-remote to get the latest commit hash without cloning
			// Note: Don't use --refs when fetching HEAD as it filters out HEAD
			const args = ref === "HEAD" ? [repoUrl, ref] : ["--refs", repoUrl, ref];
			const result = await git.listRemote(args);
			const match = result.match(/^([a-f0-9]+)/);

			if (!match) {
				throw new Error(`Could not fetch latest commit for ${repo.owner}/${repo.name}`);
			}

			return match[1];
		},
	};
};

/**
 * Pre-configured fetcher for GitHub repositories
 */
export const SimpleGitHubFetcher: Fetcher = createSimpleGitFetcher("github");

/**
 * Pre-configured fetcher for GitLab repositories
 */
export const SimpleGitLabFetcher: Fetcher = createSimpleGitFetcher("gitlab");

/**
 * Default fetcher (GitHub) - for backwards compatibility
 */
export const SimpleGitFetcher: Fetcher = SimpleGitHubFetcher;

// Re-export types from @begit/core for convenience
export type { Repository, Installable, Tarball, Fetcher, FetcherSource, DownloadAndExtract } from "@begit/core";

/**
 * Downloads a repository with automatic fallback.
 *
 * First tries the standard GitHub/GitLab API fetcher (faster, uses tarballs).
 * If that fails, falls back to using simple-git (git CLI) which works in more
 * environments but requires git to be installed.
 *
 * @param options - Download options (repo, dest, cwd, etc.)
 * @param source - The git host source ("github" or "gitlab"), defaults to "github"
 * @returns Promise that resolves when download is complete
 */
export const downloadRepo = async (
	options: DownloadAndExtract,
	source: FetcherSource = "github",
): Promise<void> => {
	// Select the appropriate fetchers based on source
	const primaryFetcher = source === "gitlab" ? GitlabFetcher : GithubFetcher;
	const fallbackFetcher = source === "gitlab" ? SimpleGitLabFetcher : SimpleGitHubFetcher;

	try {
		// Try the standard API-based fetcher first (faster)
		await begitDownloadRepo(options, primaryFetcher);
	} catch (primaryError) {
		// Log the error for debugging
		const repoPath = `${options.repo.owner}/${options.repo.name}`;
		console.warn(
			`\n⚠️  Standard download failed for ${repoPath}, trying git fallback...`,
		);

		try {
			// Fall back to git CLI-based fetcher
			await begitDownloadRepo(options, fallbackFetcher);
		} catch (fallbackError) {
			// Both methods failed, throw a combined error
			const error = new Error(
				`Failed to download repository ${repoPath}.\n` +
					`Primary method error: ${primaryError instanceof Error ? primaryError.message : String(primaryError)}\n` +
					`Fallback method error: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
			);
			throw error;
		}
	}
};
