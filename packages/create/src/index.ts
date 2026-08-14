import { defineCommand } from "citty";
import { createVanilla } from "./create-vanilla";
import * as p from "@clack/prompts";
import { cancelable, spinnerify } from "@solid-cli/utils/ui";
import { createStart } from "./create-start";
import { createSolidV2 } from "./create-solid-v2";
import { GIT_IGNORE, isValidTemplate, LIBRARY_TEMPLATES, PROJECT_TYPES, ProjectType } from "./utils/constants";
import { fetchTemplatesManifest, groupKeyFor, ManifestTemplate, resolveGroup } from "./utils/manifest";
import { detectPackageManager } from "@solid-cli/utils/package-manager";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createLibrary } from "./create-library";
import { readFile, writeFile } from "node:fs/promises";
export { createVanilla, createStart, createLibrary, createSolidV2 };

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
	solid: "Solid 2.0 (RC)",
	start: "SolidStart (Solid 1.x)",
	vanilla: "SolidJS + Vite (Solid 1.x)",
	library: "Library",
};

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
			"solid": {
				type: "boolean",
				required: false,
				description: "Create a Solid 2.0 project",
			},
			"solidstart": {
				type: "boolean",
				required: false,
				alias: "s",
				description: "Create a SolidStart project",
			},
			"v2": {
				type: "boolean",
				required: false,
				description: "Create a SolidStart v2 project",
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
			"ssr": {
				type: "boolean",
				required: false,
				description: "Enable server-side rendering (Solid 2.0 templates that support it)",
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
				solid,
				solidstart,
				library,
				vanilla,
				ssr,
				ts,
				js,
				v2,
			},
		}) {
			// Show prompts for any unknown arguments
			let projectName = projectNamePositional ?? projectNameOptional;
			let template = templatePositional ?? templateOptional;
			let projectType: ProjectType | undefined = solid
				? "solid"
				: solidstart
					? "start"
					: vanilla
						? "vanilla"
						: library
							? "library"
							: undefined;
			// False if user has selected ts, true if they have selected js, and undefined if they've done neither
			let useJS = ts ? !ts : js ? js : undefined;
			// Live template lists/paths from the templates repo; undefined falls back to the baked-in lists
			const manifest = await fetchTemplatesManifest();
			projectName ??= await cancelable(
				p.text({ message: "Project Name", placeholder: "solid-project", defaultValue: "solid-project" }),
			);
			projectType ??= await cancelable(
				p.select({
					message: "What type of project would you like to create?",
					// Solid 2.0 is listed first but not preselected while core is a release candidate
					initialValue: "start",
					options: PROJECT_TYPES.map((t) => ({
						value: t,
						label: PROJECT_TYPE_LABELS[t],
					})),
				}),
			);
			if (!projectType) return;

			let useV2: string | undefined;
			if (projectType === "start") {
				useV2 = v2
					? "v2"
					: await cancelable(
							p.select({
								message: "Which version of SolidStart?",
								initialValue: "v2",
								options: [
									{ value: "v2", label: "2 (Stable)" },
									{ value: "v1", label: "1 (Legacy)" },
								],
							}),
						);
			}
			const isV2 = useV2 === "v2";

			// Don't offer javascript if `projectType` is library
			useJS ??= projectType === "library" ? false : !(await cancelable(p.confirm({ message: "Use Typescript?" })));

			if (!projectType) return;
			const group = projectType === "library" ? undefined : resolveGroup(manifest, groupKeyFor(projectType, isV2));
			const template_opts: ManifestTemplate[] = group
				? group.templates
				: LIBRARY_TEMPLATES.map((name) => ({ name }));
			template ??= await cancelable(
				p.select({
					message: "Which template would you like to use?",
					initialValue: (template_opts.find((t) => t.default) ?? template_opts[0])?.name,
					options: template_opts
						.filter((t) => (useJS ? t : !t.name.startsWith("js")))
						.map((t) => ({ label: t.name, value: t.name })),
				}),
			);

			if (!template) return;
			const chosenTemplate = template_opts.find((t) => t.name === template);

			// SSR flip: only offered on Solid 2.0 templates that support it (e.g. "basic")
			let enableSSR = false;
			if (projectType === "solid" && chosenTemplate?.ssrToggle) {
				enableSSR =
					ssr ??
					(await cancelable(
						p.confirm({ message: "Enable server-side rendering (streaming SSR)?", initialValue: false }),
					));
			} else if (ssr) {
				p.log.warn(`--ssr is not supported for this template and will be ignored`);
			}

			// Need to transpile if the user wants Jabascript, but their selected template isn't Javascript
			const transpileToJS = useJS && !template.startsWith("js");
			if (projectType === "solid" && chosenTemplate) {
				await spinnerify({
					startText: "Creating project",
					finishText: "Project created 🎉",
					fn: () => createSolidV2({ template, destination: projectName, path: group?.path }, transpileToJS, enableSSR),
				});
			} else if (projectType === "start" && chosenTemplate) {
				await spinnerify({
					startText: "Creating project",
					finishText: "Project created 🎉",
					fn: () => createStart({ template, destination: projectName, path: group?.path }, transpileToJS, isV2),
				});
			} else if (projectType === "library" && isValidTemplate("library", template)) {
				await spinnerify({
					startText: "Creating project",
					finishText: "Project created 🎉",
					fn: () => createLibrary({ destination: projectName }),
				});
			} else if (projectType === "vanilla" && chosenTemplate) {
				await spinnerify({
					startText: "Creating project",
					finishText: "Project created 🎉",
					fn: () => createVanilla({ template, destination: projectName, path: group?.path }, transpileToJS),
				});
			} else {
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
					await writeFile(
						readmePath,
						contents +
							"\n## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)\n",
					);
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
