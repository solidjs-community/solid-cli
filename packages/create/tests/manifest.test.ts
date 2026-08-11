import { afterEach, expect, it } from "vitest";
import { fetchTemplatesManifest, parseManifest, resolveGroup } from "../src/utils/manifest";

const validManifest = {
	version: 1,
	groups: {
		solid: {
			label: "Solid 2.0",
			path: "solid-v2",
			templates: [{ name: "basic", default: true, ssrToggle: true }, { name: "bare" }],
		},
	},
};

it("parses a valid manifest", () => {
	const manifest = parseManifest(validManifest);
	expect(manifest).toBeDefined();
	expect(manifest!.groups["solid"].path).toBe("solid-v2");
	expect(manifest!.groups["solid"].templates.map((t) => t.name)).toEqual(["basic", "bare"]);
});

it("rejects unknown manifest versions and malformed documents", () => {
	expect(parseManifest({ ...validManifest, version: 2 })).toBeUndefined();
	expect(parseManifest(null)).toBeUndefined();
	expect(parseManifest("nonsense")).toBeUndefined();
	expect(parseManifest({ version: 1 })).toBeUndefined();
	expect(parseManifest({ version: 1, groups: { solid: { templates: "not-an-array" } } })).toBeUndefined();
});

it("drops malformed groups and template entries but keeps the rest", () => {
	const manifest = parseManifest({
		version: 1,
		groups: {
			solid: { path: "solid-v2", templates: [{ name: "basic" }, { notAName: true }, "bare"] },
			broken: { path: 42, templates: [{ name: "x" }] },
		},
	});
	expect(manifest).toBeDefined();
	expect(Object.keys(manifest!.groups)).toEqual(["solid"]);
	expect(manifest!.groups["solid"].templates).toEqual([{ name: "basic" }]);
});

it("resolves groups from the manifest, falling back to baked-in lists", () => {
	const manifest = parseManifest(validManifest);
	expect(resolveGroup(manifest, "solid").templates.map((t) => t.name)).toEqual(["basic", "bare"]);

	// Groups missing from the manifest fall back per-group
	expect(resolveGroup(manifest, "vanilla").path).toBe("vanilla");

	// No manifest at all: everything comes from the baked-in lists
	const baked = resolveGroup(undefined, "solid");
	expect(baked.path).toBe("solid-v2");
	expect(baked.templates.map((t) => t.name)).toEqual([
		"basic",
		"bare",
		"fullstack",
		"fullstack-tanstack",
		"with-bootstrap",
		"with-sass",
		"with-tailwindcss",
		"with-tanstack-router",
		"with-unocss",
		"with-vitest-browser-mode",
	]);
	const basic = baked.templates.find((t) => t.name === "basic")!;
	expect(basic.default).toBe(true);
	expect(basic.ssrToggle).toBe(true);
	expect(resolveGroup(undefined, "start-v2").path).toBe("solid-start-v2");
	expect(resolveGroup(undefined, "start-v1").path).toBe("solid-start-v1");
});

afterEach(() => {
	delete process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL;
});

it("silently returns undefined when the manifest fetch fails", async () => {
	// Unroutable address: connection is refused immediately
	process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL = "http://127.0.0.1:1/templates.json";
	expect(await fetchTemplatesManifest()).toBeUndefined();
});
