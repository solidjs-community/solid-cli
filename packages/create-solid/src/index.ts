#! /usr/bin/env node

import { defineCommand } from "citty";
import { createVanilla } from "./create-vanilla";
import * as p from "@clack/prompts";
import { cancelable, spinnerify } from "./utils/ui";
import { createStart } from "./create-start";
import { getTemplatesList, StartTemplate, VanillaTemplate } from "./utils/constants";

export const createSolid = (version: string) => defineCommand({
	meta: {
		name: "create-solid",
		version: version,
	},
	args: {
		projectNamePositional: {
			type: "positional",
			required: false,
			description: "Project name"
		},
		templatePositional: {
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
		solidstart: {
			type: "boolean",
			required: false,
			alias: "s",
			description: "Create a SolidStart project",
		},
	},
	async run({ args: { projectNamePositional, templatePositional, "project-name": projectNameOptional, solidstart } }) {
		let projectName: string = projectNamePositional ?? projectNameOptional;
		let template: string = templatePositional;
		let isStart: boolean = solidstart;
		let isJS = false;
		projectName ??= await cancelable(
			p.text({ message: "Project Name", placeholder: "solid-project", defaultValue: "solid-project" }),
		);
		isStart ??= await cancelable(p.confirm({ message: "Is this a SolidStart project?" }));
		const template_opts = await getTemplatesList(isStart);
		template ??= (await cancelable(
			p.select({
				message: "Which template would you like to use?",
				initialValue: "ts",
				options: template_opts.map((s: string) => ({ label: s, value: s })),
			}),
		));
		isJS = !(await cancelable(p.confirm({ message: "Use Typescript?" })))

		if (isStart) {
			await spinnerify({
				startText: "Creating project",
				finishText: "Project created 🎉",
				fn: () => createStart({ template: template as StartTemplate, destination: projectName }, isJS),
			})
		} else {
			await spinnerify({
				startText: "Creating project",
				finishText: "Project created 🎉",
				fn: () => createVanilla({ template: template as VanillaTemplate, destination: projectName }, isJS),
			})
		}
	}
})
