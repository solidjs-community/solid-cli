import * as p from "@clack/prompts";
import { openInBrowser } from "@solid-cli/utils";
import { cancelable, spinnerify } from "@solid-cli/ui";
import { t } from "@solid-cli/utils";
import { insertAtEnd, readFileToString } from "@solid-cli/utils/fs";
import { flushQueue } from "@solid-cli/utils/updates";
import { rm } from "fs/promises";
import { join, resolve } from "path";
import { Dirent, copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { downloadRepo } from "@begit/core";
import { transform } from "sucrase";
import { detectPackageManager } from "@solid-cli/utils/package-manager";
const gitIgnore = `
dist
.solid
.output
.vercel
.netlify
.vinxi

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

const templates = [
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
	"with-trpc",
	"with-unocss",
	"with-vitest",
	"experiments",
] as const;
const extensions = ["ts", "js"] as const;

export type Extension = (typeof extensions)[number];
export const isExtension = (extension: string): extension is Extension => {
	return extensions.indexOf(extension as any) !== -1;
};
export type Template = (typeof templates)[number];
export const isTemplate = (template: string): template is Template => {
	return templates.indexOf(template as any) !== -1;
};
const modifyReadme = async (name: string) => {
	await insertAtEnd(
		`${name}/README.md`,
		"\n## This project was created with the [Solid CLI](https://solid-cli.netlify.app)\n",
	);
	await flushQueue();
};

const recurseFiles = (startPath: string, cb: (file: Dirent, startPath: string) => void) => {
	startPath = resolve(startPath);

	const files = readdirSync(startPath, { withFileTypes: true });

	for (const file of files) {
		cb(file, startPath);
	}
};

const convertToJS = async (file: Dirent, startPath: string) => {
	const src = join(startPath, file.name);
	const dest = resolve(startPath.replace(".solid-start", ""), file.name);
	if (file.isDirectory()) {
		mkdirSync(dest, { recursive: true });
		recurseFiles(resolve(startPath, file.name), convertToJS);
	} else if (file.isFile()) {
		if (src.endsWith(".ts") || src.endsWith(".tsx")) {
			let { code } = transform(await readFileToString(src), {
				transforms: ["typescript", "jsx"],
				jsxRuntime: "preserve",
			});

			writeFileSync(dest.replace(".ts", ".js"), code, { flag: "wx" });
		} else {
			copyFileSync(src, dest);
		}
	}
};

const handleTSConversion = async (tempDir: string, projectName: string) => {
	await rm(resolve(tempDir, "tsconfig.json"));
	writeFileSync(
		resolve(projectName, "jsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					jsx: "preserve",
					jsxImportSource: "solid-js",
					paths: {
						"~/*": ["./src/*"],
					},
				},
			},
			null,
			2,
		),
		{ flag: "wx" },
	);

	// Convert all ts files in temp directory into js
	recurseFiles(tempDir, convertToJS);

	// Remove temp directory
	await rm(join(process.cwd(), tempDir), {
		recursive: true,
		force: true,
	});
};

const handleNewStartProject = async (projectName: string, template?: Template, extension?: Extension) => {
	template ??= await cancelable(
		p.select({
			message: t.NEW_START,
			initialValue: "basic" satisfies Template as Template,
			options: templates.map((s) => ({ label: s, value: s })),
			maxItems: process.stdout.rows - 4,
		}),
	);

	const withTs = extension ? extension !== "ts" : await cancelable(p.confirm({ message: "Use Typescript?" }));

	// If the user does not want ts, we create the project in a temp directory inside the project directory
	const tempDir = withTs ? projectName : join(projectName, ".solid-start");
	const readmeAlreadyExists = existsSync(join(projectName, "README.md"));
	await spinnerify({
		startText: t.CREATING_PROJECT,
		finishText: t.PROJECT_CREATED,
		fn: async () => {
			await downloadRepo({
				repo: { owner: "solidjs", name: "solid-start", subdir: `examples/${template}` },
				dest: tempDir,
			});
		},
	});

	if (!withTs) await handleTSConversion(tempDir, projectName);

	// Add .gitignore
	writeFileSync(join(projectName, ".gitignore"), gitIgnore);
	if (!readmeAlreadyExists) await modifyReadme(projectName);
	const pM = detectPackageManager();
	p.note(
		`cd ${projectName}
${pM.name} install
${pM.name} ${pM.runScriptCommand("dev")}`,
		t.GET_STARTED,
	);
};

const handleAutocompleteNew = async (name: string, template?: Template, isStart?: boolean) => {
	isStart ??= await cancelable(p.confirm({ message: t.IS_START_PROJECT }));

	if (isStart) {
		handleNewStartProject(name, template);
		return;
	}

	const extension = await cancelable(
		p.select({
			message: "Use Typescript?",
			initialValue: "ts" satisfies Extension as Extension,
			options: extensions.map((s) => ({ label: s, value: s })),
		}),
	);

	await handleNew({ extension, name });
};
export const handleNew = async (
	x: {
		extension?: Extension;
		template?: Template;
		name?: string;
		stackblitz?: boolean;
		isStart?: boolean;
	} = {},
) => {
	x.name ??= await cancelable(
		p.text({ message: t.PROJECT_NAME, placeholder: "solid-project", defaultValue: "solid-project" }),
	);

	if (!x.extension) {
		await handleAutocompleteNew(x.name, x.template, x.isStart);
		return;
	}

	if (x.stackblitz) {
		await spinnerify({
			startText: t.OPENING_IN_BROWSER(x.extension),
			finishText: t.OPENED_IN_BROWSER,
			fn: () => openInBrowser(`https://solid.new/${x.extension}`),
		});
		return;
	}

	const withTs = x.extension ? x.extension === "ts" : await cancelable(p.confirm({ message: "Use Typescript?" }));

	// If the user does not want ts, we create the project in a temp directory inside the project directory
	const tempDir = withTs ? x.name : join(x.name, ".solid-start");
	const readmeAlreadyExists = existsSync(join(x.name, "README.md"));

	await spinnerify({
		startText: t.CREATING_PROJECT,
		finishText: t.PROJECT_CREATED,
		fn: async () => {
			await downloadRepo({ repo: { owner: "solidjs", name: "templates", subdir: x.extension }, dest: tempDir });
		},
	});

	if (!withTs) await handleTSConversion(tempDir, x.name);

	// Add .gitignore
	writeFileSync(join(x.name, ".gitignore"), gitIgnore);
	if (!readmeAlreadyExists) await modifyReadme(x.name ?? x.extension);
	const pM = detectPackageManager();
	p.note(
		`cd ${x.name}
${pM.name} install
${pM.name} ${pM.runScriptCommand("dev")}`,
		t.GET_STARTED,
	);
};
