import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SimpleGitFetcher } from "../src/utils/download-repo";
import { downloadRepo } from "@begit/core";
import { existsSync, rmSync, mkdirSync } from "fs";
import { join } from "path";

const TEST_DIR = "./test-simple-git-fetcher";

describe("SimpleGitFetcher", () => {
	beforeAll(() => {
		// Clean up test directory before tests
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
		mkdirSync(TEST_DIR, { recursive: true });
	});

	afterAll(() => {
		// Clean up test directory after tests
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true, force: true });
		}
	});

	describe("fetchLatestCommit", () => {
		it("should fetch the latest commit hash", async () => {
			const repo = { owner: "solidjs", name: "templates" };
			const commit = await SimpleGitFetcher.fetchLatestCommit(repo);

			expect(typeof commit).toBe("string");
			expect(commit.length).toBeGreaterThanOrEqual(7);
			expect(commit).toMatch(/^[a-f0-9]+$/);
		}, 30000);

		it("should fetch commit for a specific branch", async () => {
			const repo = { owner: "solidjs", name: "templates", branch: "main" };
			const commit = await SimpleGitFetcher.fetchLatestCommit(repo);

			expect(typeof commit).toBe("string");
			expect(commit).toMatch(/^[a-f0-9]+$/);
		}, 30000);

		it("should throw for non-existent repo", async () => {
			const repo = { owner: "solidjs", name: "non-existent-repo-12345" };

			await expect(SimpleGitFetcher.fetchLatestCommit(repo)).rejects.toThrow();
		}, 30000);
	});

	describe("fetchTarball", () => {
		it("should return a valid tarball object", async () => {
			const repo = { owner: "solidjs", name: "templates" };
			const tarball = await SimpleGitFetcher.fetchTarball(repo);

			expect(tarball).toBeDefined();
			expect(typeof tarball.name).toBe("string");
			expect(tarball.name).toContain("solidjs");
			expect(tarball.name.endsWith(".tar.gz")).toBe(true);
			expect(tarball.body).toBeDefined();

			// Clean up - cancel the stream
			await tarball.body.cancel();
		}, 120000);
	});

	describe("integration with downloadRepo", () => {
		it("should download a repository subdirectory using SimpleGitFetcher", async () => {
			const dest = join(TEST_DIR, "vanilla-basic");

			await downloadRepo(
				{
					repo: {
						owner: "solidjs",
						name: "templates",
						subdir: "vanilla/basic",
					},
					dest,
				},
				SimpleGitFetcher,
			);

			// Verify key files exist
			expect(existsSync(dest)).toBe(true);
			expect(existsSync(join(dest, "package.json"))).toBe(true);
			expect(existsSync(join(dest, "src"))).toBe(true);
		}, 120000); // 2 minute timeout for full download
	});
});

