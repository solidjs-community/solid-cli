import { afterEach, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createSolidV2, createVanilla } from "../src";
import { fetchTemplatesManifest, resolveGroup, type ManifestGroupKey } from "../src/utils/manifest";

/**
 * These download from live solidjs/templates HEAD, so they assert the plumbing —
 * that the right subdir was fetched and extracted into a usable project — rather
 * than specific files or dependency versions. Template contents, pins and file
 * layout all change upstream without a CLI release, and must not fail CI here.
 */

/** Template name + subdir the CLI would actually use, from the live manifest (baked-in fallback) */
const liveTarget = async (key: ManifestGroupKey) => {
	const group = resolveGroup(await fetchTemplatesManifest(), key);
	const template = group.templates.find((t) => t.default) ?? group.templates[0];
	return { path: group.path, template: template.name };
};

// begit resolves the destination against `process.cwd()`, so scaffold targets have to be
// repo-relative. `test/` is gitignored; each run starts from a clean directory so a
// leftover scaffold can never satisfy the assertions on its own.
const destinations: string[] = [];
const scratch = (name: string) => {
	const destination = join("test", name);
	rmSync(destination, { recursive: true, force: true });
	destinations.push(destination);
	return destination;
};

afterEach(() => {
	for (const destination of destinations.splice(0)) rmSync(destination, { recursive: true, force: true });
});

const expectScaffold = (destination: string) => {
	const packageJsonPath = join(destination, "package.json");
	expect(existsSync(packageJsonPath)).toBe(true);

	const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
	expect(typeof packageJson.name).toBe("string");
	expect(Object.keys(packageJson.scripts ?? {}).length).toBeGreaterThan(0);
	expect(Object.keys(packageJson.dependencies ?? {}).length).toBeGreaterThan(0);

	// Some source to build, whatever the entry files happen to be called
	expect(readdirSync(join(destination, "src")).length).toBeGreaterThan(0);
};

it("downloads and extracts the vanilla template", async () => {
	const destination = scratch("vanilla");
	const { path, template } = await liveTarget("vanilla");

	await createVanilla({ template, destination, path }, false);

	expectScaffold(destination);
});

it("downloads and extracts the solid-v2 template", async () => {
	const destination = scratch("solid-v2");
	const { path, template } = await liveTarget("solid");

	await createSolidV2({ template, destination, path }, false);

	expectScaffold(destination);
});
