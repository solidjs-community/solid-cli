import { defineCommand } from "citty";
import { createVanilla } from "./create-vanilla";
import * as p from "@clack/prompts";
import { cancelable, spinnerify } from "@solid-cli/utils/ui";
import { createStart } from "./create-start";
import {
	getTemplatesList,
	GIT_IGNORE,
	isValidTemplate,
	PROJECT_TYPES,
	ProjectType,
} from "./utils/constants";
import { detectPackageManager } from "@solid-cli/utils/package-manager";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createLibrary } from "./create-library";
import { readFile, writeFile } from "node:fs/promises";
export { createVanilla, createStart, createLibrary };

export const createSolid = (version: string) =>
	defineCommand({
		meta: {
			name: "create-solid",
			description: "A CLI for scaffolding new Solid projects",
			version: version,
		},
		args: {
			"projectNamePositional": {
				type: "positional",
				required: false,
				description: "Project name",
			},
			"templatePositional": {
				type: "positional",
				required: false,
				description: "Template name",
			},
			"project-name": {
				type: "string",
				required: false,
				alias: "p",
				description: "Project name",
			},
			"template": {
				type: "string",
				required: false,
				alias: "t",
				description: "Template name",
			},
			"solidstart": {
				type: "boolean",
				required: false,
				alias: "s",
				description: "Create a SolidStart project",
			},
			"library": {
				type: "boolean",
				required: false,
				alias: "l",
				description: "Create a Library project",
			},
			"vanilla": {
				type: "boolean",
				required: false,
				alias: "v",
				description: "Create a vanilla (SolidJS + Vite) project",
			},
			"ts": {
				type: "boolean",
				required: false,
				description: "Use typescript",
			},
			"js": {
				type: "boolean",
				required: false,
				description: "Use javascript",
			},
		},
		async run({
			args: {
				projectNamePositional,
				templatePositional,
				"project-name": projectNameOptional,
				"template": templateOptional,
				solidstart,
				library,
				vanilla,
				ts,
				js,
			},
		}) {
			// Show prompts for any unknown arguments
			let projectName = projectNamePositional ?? projectNameOptional;
			let template = templatePositional ?? templateOptional;
			let projectType: ProjectType | undefined = solidstart ? "start" : (vanilla ? "vanilla" : (library ? "library" : undefined));
			// False if user has selected ts, true if they have selected js, and undefined if they've done neither
			let useJS = ts ? !ts : js ? js : undefined;
			projectName ??= await cancelable(
				p.text({ message: "Project Name", placeholder: "solid-project", defaultValue: "solid-project" }),
			);
			projectType ??= await cancelable(
				p.select({
					message: "What type of project would you like to create?",
					initialValue: "start",
					options: PROJECT_TYPES.map((t) => ({
						value: t,
						label: t === "start" ? "SolidStart" : t === "vanilla" ? "SolidJS + Vite" : "Library",
					})),
				}),
			);
			// Don't offer javascript if `projectType` is library
			useJS ??= projectType === "library" ? false : !(await cancelable(p.confirm({ message: "Use Typescript?" })));

			const template_opts = getTemplatesList(projectType);
			template ??= await cancelable(
				p.select({
					message: "Which template would you like to use?",
					initialValue: "ts",
					options: template_opts
						.filter((s) => (useJS ? s : !s.startsWith("js")))
						.map((s: string) => ({ label: s, value: s })),
				}),
			);

			// Need to transpile if the user wants Jabascript, but their selected template isn't Javascript
			const transpileToJS = useJS && !template.startsWith("js");
			if (projectType === "start" && isValidTemplate("start", template)) {
				await spinnerify({
					startText: "Creating project",
					finishText: "Project created 🎉",
					fn: () => createStart({ template, destination: projectName }, transpileToJS),
				});
			} else if (projectType === "library" && isValidTemplate("library", template)) {
				await spinnerify({
					startText: "Creating project",
					finishText: "Project created 🎉",
					fn: () => createLibrary({ destination: projectName }),
				});
			} else if (projectType === "vanilla" && isValidTemplate(projectType, template)) {
				await spinnerify({
					startText: "Creating project",
					finishText: "Project created 🎉",
					fn: () => createVanilla({ template, destination: projectName }, transpileToJS),
				});
			}
			else {
				p.log.error(`Template ${template} is not valid for project type ${projectType}`);
				process.exit(0);
			}
			// Add .gitignore
			writeFileSync(join(projectName, ".gitignore"), GIT_IGNORE);
			// Add "Created with Solid CLI" text to bottom of README
			const readmePath = `${projectName}/README.md`;
			if (existsSync(readmePath)) {
				const contents = (await readFile(readmePath)).toString();
				if (!contents.includes("This project was created with the [Solid CLI]"))
					await writeFile(readmePath, contents + "\n## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)\n")
			}
			// Next steps..
			const pM = detectPackageManager();
			p.note(
				(projectName === "." ? "" : `cd ${projectName}\n`) +
					`${pM.name} install
${pM.name} ${pM.runScriptCommand("dev")}`,
				"To get started, run:",
			);
		},
	});
