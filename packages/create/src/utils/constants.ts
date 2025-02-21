export const GIT_IGNORE = `
dist
.solid
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
] as const;
export type VanillaTemplate = (typeof VANILLA_TEMPLATES)[number];

const START_TEMPLATES = [
	"basic",
	"bare",
	"hackernews",
	"notes",
	"todomvc",
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
] as const;
export type StartTemplate = (typeof START_TEMPLATES)[number];

export const getTemplatesList = async (isStart: boolean) => {
	if (isStart) {
		return START_TEMPLATES;
	}
	return VANILLA_TEMPLATES;
};

//
