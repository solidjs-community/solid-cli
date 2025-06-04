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

// Supported templates

/**Supported Vanilla Templates */
const VANILLA_TEMPLATES = [
	"ts",
	"ts-vitest",
	"ts-uvu",
	"ts-unocss",
	"ts-tailwindcss",
	"ts-sass",
	"ts-router",
	"ts-router-file-based",
	"ts-minimal",
	"ts-jest",
	"ts-bootstrap",
	"js",
	"js-vitest",
	"js-tailwindcss",
] as const satisfies string[];
export type VanillaTemplate = (typeof VANILLA_TEMPLATES)[number];

/**Supported Start Templates */
const START_TEMPLATES = [
	"basic",
	"bare",
	"hackernews",
	"notes",
	"todomvc",
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
	"experiments",
] as const satisfies string[];
export type StartTemplate = (typeof START_TEMPLATES)[number];

/**Supported Library Templates */
export const LIBRARY_TEMPLATES = ["solid-lib-starter"] as const satisfies string[];
export type LibraryTemplate = (typeof LIBRARY_TEMPLATES)[number];

export const PROJECT_TYPES = ["start", "vanilla", "library"] as const satisfies string[];
export type ProjectType = (typeof PROJECT_TYPES)[number];

/**
 * Fetches the template list for the project type given
 * @param projectType type of project
 */
export function getTemplatesList(projectType: "vanilla"): StartTemplate[];
export function getTemplatesList(projectType: "start"): VanillaTemplate[];
export function getTemplatesList(projectType: "library"): VanillaTemplate[];
export function getTemplatesList(projectType: ProjectType): VanillaTemplate[] | StartTemplate[] | LibraryTemplate[];
export function getTemplatesList(projectType: ProjectType) {
	if (projectType === "start") {
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
export function isValidTemplate(type: "vanilla", maybe_template: string): VanillaTemplate;
export function isValidTemplate(type: "start", maybe_template: string): StartTemplate;
export function isValidTemplate(type: "library", maybe_template: string): LibraryTemplate;
export function isValidTemplate(type: ProjectType, maybe_template: string) {
	const templates = getTemplatesList(type);
	return templates.find(t => t === maybe_template)
}
