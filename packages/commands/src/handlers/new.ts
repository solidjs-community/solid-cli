import * as p from "@clack/prompts";
import { openInBrowser } from "@solid-cli/utils";
import { cancelable, spinnerify } from "@solid-cli/ui";
import { t } from "@solid-cli/utils";
import { insertAtEnd, readFileToString } from "@solid-cli/utils/fs";
import { flushQueue } from "@solid-cli/utils/updates";
import { rm } from "fs/promises";
import { basename, join, resolve } from "path";
import { Dirent, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { downloadAndExtract } from "@begit/core";
import { transform } from "sucrase";
const gitIgnore = `
dist
.solid
.output
.vercel
.netlify
netlify
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

const startSupported = [
	"bare",
	"basic",
	"experiments",
	"hackernews",
	"todomvc",
	"with-auth",
	"with-mdx",
	"with-prisma",
	"with-solid-styled",
	"with-tailwindcss",
	"with-trpc",
] as const;
const localSupported = ["ts", "js"] as const;
const stackblitzSupported = ["bare"] as const;

type AllSupported = (typeof localSupported)[number] | (typeof stackblitzSupported)[number];

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
			// code = await prettier.format(code, {
			// 	parser: "babel",
			// });

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

	// Update package.json to remove type deps
	const name = basename(resolve(projectName));
	const pkg_file = join(projectName, "package.json");
	const pkg_json = JSON.parse(
		readFileSync(pkg_file, "utf-8")
			.replace(/"name": ".+"/, (_m) => `"name": "${name}"`)
			.replace(/"(.+)": "workspace:.+"/g, (_m, name) => `"${name}": "next"`),
	);

	delete pkg_json.dependencies["@types/cookie"];
	delete pkg_json.dependencies["@types/debug"];
	delete pkg_json.devDependencies["@types/babel__core"];
	delete pkg_json.devDependencies["@types/node"];
	delete pkg_json.devDependencies["typescript"];
	delete pkg_json.devDependencies["@types/wait-on"];

	writeFileSync(pkg_file, JSON.stringify(pkg_json, null, 2));

	// Remove temp directory
	await rm(join(process.cwd(), tempDir), {
		recursive: true,
		force: true,
	});
};

const handleNewStartProject = async (projectName: string) => {
	const template = await cancelable(
		p.select({
			message: t.NEW_START,
			initialValue: "ts",
			options: startSupported.map((s) => ({ label: s, value: s })),
		}),
	);

	const withTs = await cancelable(p.confirm({ message: "Use Typescript?" }));

	// If the user does not want ts, we create the project in a temp directory inside the project directory
	const tempDir = withTs ? projectName : join(projectName, ".solid-start");
	const readmeAlreadyExists = existsSync(join(projectName, "README.md"));
	await spinnerify({
		startText: t.CREATING_PROJECT,
		finishText: t.PROJECT_CREATED,
		fn: async () => {
			// const emitter = degit(`solidjs/solid-start/examples/${template}#main`);
			// emitter.on("info", ({ message }) => p.log.info(message));
			// await emitter.clone(tempDir);
			await downloadAndExtract({
				repo: { owner: "solidjs", name: "solid-start", subdir: `examples/${template}` },
				dest: tempDir,
			});
		},
	});

	if (!withTs) await handleTSConversion(tempDir, projectName);

	// Add .gitignore
	writeFileSync(join(projectName, ".gitignore"), gitIgnore);
	if (!readmeAlreadyExists) await modifyReadme(projectName);

	p.log.info(`${t.GET_STARTED}
  - cd ${projectName}
  - npm install
  - npm run dev`);
};

const handleAutocompleteNew = async () => {
	const name = await cancelable(
		p.text({ message: t.PROJECT_NAME, placeholder: "solid-project", defaultValue: "solid-project" }),
	);

	const isStart = await cancelable(p.confirm({ message: t.IS_START_PROJECT }));

	if (isStart) {
		handleNewStartProject(name);
		return;
	}

	const template = (await cancelable(
		p.select({
			message: t.TEMPLATE,
			initialValue: "ts",
			options: localSupported.map((s) => ({ label: s, value: s })),
		}),
	)) as unknown as AllSupported;

	await handleNew(template, name);
};
export const handleNew = async (
	variation?: AllSupported,
	name: string = "solid-project",
	stackblitz: boolean = false,
) => {
	if (!variation) {
		await handleAutocompleteNew();
		return;
	}

	if (stackblitz) {
		await spinnerify({
			startText: t.OPENING_IN_BROWSER(variation),
			finishText: t.OPENED_IN_BROWSER,
			fn: () => openInBrowser(`https://solid.new/${variation}`),
		});
		return;
	}

	const withTs = await cancelable(p.confirm({ message: "Use Typescript?" }));

	// If the user does not want ts, we create the project in a temp directory inside the project directory
	const tempDir = withTs ? name : join(name, ".solid-start");
	const readmeAlreadyExists = existsSync(join(name, "README.md"));

	await spinnerify({
		startText: t.CREATING_PROJECT,
		finishText: t.PROJECT_CREATED,
		fn: async () => {
			// const emitter = degit(`solidjs/templates/${variation}`);
			// emitter.on("info", ({ message }) => p.log.info(message));
			// await emitter.clone(tempDir);
			await downloadAndExtract({ repo: { owner: "solidjs", name: "templates", subdir: variation }, dest: tempDir });
		},
	});

	if (!withTs) await handleTSConversion(tempDir, name);

	// Add .gitignore
	writeFileSync(join(name, ".gitignore"), gitIgnore);
	if (!readmeAlreadyExists) await modifyReadme(name ?? variation);
	p.log.info(`${t.GET_STARTED}
  - cd ${name}
  - npm install
  - npm run dev`);
};
