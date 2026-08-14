export const GIT_IGNORE = `dist
.wrangler
.output
.vercel
.netlify
.vinxi
app.config.timestamp_*.js

# Environment
.env
.env*.local

# dependencies
/node_modules

# IDEs and editors
/.idea
.project
.classpath
*.launch
.settings/

# Temp
gitignore

# System Files
.DS_Store
Thumbs.db
`;

export const JS_CONFIG = {
	compilerOptions: {
		jsx: "preserve",
		jsxImportSource: "solid-js",
		paths: {
			"~/*": ["./src/*"],
		},
	},
};

// The solid-v2 templates don't use the `~/*` path alias, and Solid 2.0's JSX
// runtime lives in `@solidjs/web` (matches the templates' tsconfig.json)
export const JS_CONFIG_SOLID_V2 = {
	compilerOptions: {
		jsx: "preserve",
		jsxImportSource: "@solidjs/web",
	},
};

// Supported templates

/**Supported Vanilla Templates */
export const VANILLA_TEMPLATES = [
	"basic",
	"bare",
	"with-vitest",
	"with-uvu",
	"with-unocss",
	"with-tailwindcss",
	"with-sass",
	"with-solid-router",
	"with-vite-plugin-pages",
	"with-tanstack-router-config-based",
	"with-tanstack-router-file-based",
	"with-tanstack-start",
	"with-jest",
	"with-bootstrap",
] as const satisfies string[];
export type VanillaTemplate = (typeof VANILLA_TEMPLATES)[number];

/**
 * @description This list is hardcoded. But templates are fetched from another github repo.
 * @see https://github.com/solidjs/templates/tree/main/solid-start
 */
export const START_TEMPLATES = [
	"basic",
	"bare",
	"with-solidbase",
	"with-auth",
	"with-authjs",
	"with-drizzle",
	"with-mdx",
	"with-prisma",
	"with-solid-styled",
	"with-tailwindcss",
	"with-tanstack-router",
	"with-trpc",
	"with-unocss",
	"with-vitest",
	"with-strict-csp",
] as const satisfies string[];

export type StartTemplate = (typeof START_TEMPLATES)[number];

export const START_TEMPLATES_V2 = [
	"basic",
	"bare",
	"with-auth",
	"with-authjs",
	"with-drizzle",
	"with-mdx",
	"with-prisma",
	"with-solid-styled",
	"with-solidbase",
	"with-strict-csp",
	"with-tailwindcss",
	"with-trpc",
	"with-unocss",
	"with-vitest",
] as const satisfies string[];

export type StartTemplateV2 = (typeof START_TEMPLATES_V2)[number];

/**
 * Solid 2.0 templates (templates repo: `solid-v2/`)
 * @see https://github.com/solidjs/templates/tree/main/solid-v2
 */
export const SOLID_V2_TEMPLATES = [
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
] as const satisfies string[];
export type SolidV2Template = (typeof SOLID_V2_TEMPLATES)[number];

/**Supported Library Templates */
export const LIBRARY_TEMPLATES = ["solid-lib-starter"] as const satisfies string[];
export type LibraryTemplate = (typeof LIBRARY_TEMPLATES)[number];

// "solid" (Solid 2.0) is listed first, but "start" remains the preselected
// default while Solid 2.0 core is a release candidate
export const PROJECT_TYPES = ["solid", "start", "vanilla", "library"] as const satisfies string[];
export type ProjectType = (typeof PROJECT_TYPES)[number];

/**
 * Fetches the template list for the project type given
 * @param projectType type of project
 */
export function getTemplatesList(projectType: "vanilla", v2?: boolean): VanillaTemplate[];
export function getTemplatesList(projectType: "solid", v2?: boolean): SolidV2Template[];
export function getTemplatesList(projectType: "start", v2?: boolean): StartTemplate[] | StartTemplateV2[];
export function getTemplatesList(projectType: "library", v2?: boolean): LibraryTemplate[];
export function getTemplatesList(
	projectType: ProjectType,
	v2?: boolean,
): VanillaTemplate[] | SolidV2Template[] | StartTemplate[] | StartTemplateV2[] | LibraryTemplate[];
export function getTemplatesList(projectType: ProjectType, v2?: boolean) {
	if (projectType === "solid") {
		return SOLID_V2_TEMPLATES as unknown as SolidV2Template[];
	} else if (projectType === "start") {
		if (v2) {
			return START_TEMPLATES_V2 as unknown as StartTemplateV2[];
		}
		return START_TEMPLATES as StartTemplate[];
	} else if (projectType === "library") {
		return LIBRARY_TEMPLATES as LibraryTemplate[];
	}
	return VANILLA_TEMPLATES as VanillaTemplate[];
}

/**
 * Tests is the template given is a valid template, and returns it as a template if it is
 * @param type expected type of the template
 * @param maybe_template the template string to test
 * @returns the template string if it is valid, undefined if not
 */
export function isValidTemplate(type: "vanilla", maybe_template: string): maybe_template is VanillaTemplate;
export function isValidTemplate(type: "solid", maybe_template: string): maybe_template is SolidV2Template;
export function isValidTemplate(
	type: "start",
	maybe_template: string,
	v2?: boolean,
): maybe_template is StartTemplate | StartTemplateV2;
export function isValidTemplate(type: "library", maybe_template: string): maybe_template is LibraryTemplate;
export function isValidTemplate(type: ProjectType, maybe_template: string, v2?: boolean) {
	const templates = getTemplatesList(type, v2);
	return templates.find((t) => t === maybe_template) !== undefined;
}
