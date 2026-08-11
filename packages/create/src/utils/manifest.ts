import {
	SOLID_V2_TEMPLATES,
	START_TEMPLATES,
	START_TEMPLATES_V2,
	VANILLA_TEMPLATES,
	ProjectType,
} from "./constants";

/**
 * `templates.json` manifest published at the root of the solidjs/templates repo.
 * When reachable, it is the source of truth for template names, subdir paths and
 * per-template flags, so the templates repo can add/reorganize templates without
 * requiring a CLI release. The baked-in lists in `constants.ts` are the fallback.
 */
export type ManifestTemplate = {
	name: string;
	/** Preselected in the template prompt */
	default?: boolean;
	/** Offer the "Enable server-side rendering?" prompt for this template */
	ssrToggle?: boolean;
};

export type ManifestGroup = {
	label?: string;
	/** Subdir prefix inside the templates repo, e.g. "solid-v2" */
	path: string;
	status?: string;
	templates: ManifestTemplate[];
};

export type TemplatesManifest = {
	version: number;
	groups: Record<string, ManifestGroup>;
};

/** Manifest groups the CLI understands (library comes from a different repo and stays baked-in) */
export type ManifestGroupKey = "solid" | "start-v2" | "start-v1" | "vanilla";

export const MANIFEST_URL = "https://raw.githubusercontent.com/solidjs/templates/HEAD/templates.json";
const MANIFEST_TIMEOUT_MS = 2000;

const asTemplates = (names: readonly string[], defaultName?: string, ssrToggle?: string): ManifestTemplate[] =>
	names.map((name) => ({
		name,
		...(name === defaultName ? { default: true } : {}),
		...(name === ssrToggle ? { ssrToggle: true } : {}),
	}));

/** Baked-in fallback, used whenever the manifest can't be fetched or parsed */
export const BAKED_GROUPS: Record<ManifestGroupKey, ManifestGroup> = {
	"solid": {
		label: "Solid 2.0",
		path: "solid-v2",
		templates: asTemplates(SOLID_V2_TEMPLATES, "basic", "basic"),
	},
	"start-v2": {
		label: "SolidStart 2",
		path: "solid-start-v2",
		templates: asTemplates(START_TEMPLATES_V2, "basic"),
	},
	"start-v1": {
		label: "SolidStart 1",
		path: "solid-start-v1",
		templates: asTemplates(START_TEMPLATES, "basic"),
	},
	"vanilla": {
		label: "SolidJS + Vite",
		path: "vanilla",
		templates: asTemplates(VANILLA_TEMPLATES, "basic"),
	},
};

/**
 * Validates an untrusted parsed JSON value into a `TemplatesManifest`.
 * Returns `undefined` for anything unusable (unknown major version, wrong shape),
 * dropping malformed groups/entries rather than failing outright.
 */
export const parseManifest = (raw: unknown): TemplatesManifest | undefined => {
	if (!raw || typeof raw !== "object") return undefined;
	const manifest = raw as TemplatesManifest;
	if (manifest.version !== 1) return undefined;
	if (!manifest.groups || typeof manifest.groups !== "object") return undefined;
	const groups: Record<string, ManifestGroup> = {};
	for (const [key, group] of Object.entries(manifest.groups)) {
		if (!group || typeof group !== "object") continue;
		if (typeof group.path !== "string" || !Array.isArray(group.templates)) continue;
		const templates = group.templates.filter(
			(t): t is ManifestTemplate => !!t && typeof t === "object" && typeof t.name === "string",
		);
		if (templates.length === 0) continue;
		groups[key] = { ...group, templates };
	}
	if (Object.keys(groups).length === 0) return undefined;
	return { version: 1, groups };
};

/**
 * Fetches the live manifest from the templates repo (HEAD, small file, short timeout).
 * Any failure — offline, timeout, 404, malformed JSON, unknown version — resolves to
 * `undefined` so callers silently fall back to the baked-in lists.
 */
export const fetchTemplatesManifest = async (): Promise<TemplatesManifest | undefined> => {
	try {
		const url = process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL || MANIFEST_URL;
		const res = await fetch(url, { signal: AbortSignal.timeout(MANIFEST_TIMEOUT_MS) });
		if (!res.ok) return undefined;
		return parseManifest(await res.json());
	} catch {
		return undefined;
	}
};

/** Maps the CLI's project type (+ SolidStart version) to a manifest group key */
export const groupKeyFor = (projectType: Exclude<ProjectType, "library">, startV2?: boolean): ManifestGroupKey =>
	projectType === "start" ? (startV2 ? "start-v2" : "start-v1") : projectType;

/** Resolves a group from the manifest, falling back to the baked-in lists */
export const resolveGroup = (manifest: TemplatesManifest | undefined, key: ManifestGroupKey): ManifestGroup =>
	manifest?.groups[key] ?? BAKED_GROUPS[key];
