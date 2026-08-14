import { afterEach, expect, it, vi } from "vitest";
import { GithubFetcher } from "@begit/core";
import { latestTemplatesCommit } from "../src/utils/download";

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

it("resolves HEAD to a sha so begit can cache the tarball under it", async () => {
	vi.spyOn(GithubFetcher, "fetchLatestCommit").mockResolvedValue("c3032d9");

	expect(await latestTemplatesCommit()).toBe("c3032d9");
});

it("falls back to no sha when the commit lookup throws", async () => {
	// Offline, DNS failure, or a non-JSON response from the API
	vi.spyOn(GithubFetcher, "fetchLatestCommit").mockRejectedValue(new Error("fetch failed"));

	expect(await latestTemplatesCommit()).toBeUndefined();
});

it("falls back to no sha when the API answers without one", async () => {
	// What a rate-limited response looks like by the time begit is done with it
	vi.spyOn(GithubFetcher, "fetchLatestCommit").mockResolvedValue(undefined);

	expect(await latestTemplatesCommit()).toBeUndefined();
});

it("falls back to no sha rather than letting a hanging lookup block the scaffold", async () => {
	vi.useFakeTimers();
	vi.spyOn(GithubFetcher, "fetchLatestCommit").mockReturnValue(new Promise(() => {}));

	const resolved = latestTemplatesCommit();
	await vi.advanceTimersByTimeAsync(2000);

	expect(await resolved).toBeUndefined();
});
