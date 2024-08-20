#! /usr/bin/env node
import { Template, handleNew, isTemplate } from "@solid-cli/commands/new";
import color from "picocolors";
import { intro } from "@clack/prompts";
import { version } from "../package.json";
import { command, run, option, string, boolean, flag, optional, positional } from "cmd-ts";

intro(`\n${color.bgCyan(color.black(` Create-Solid v${version}`))}`);

const app = command({
	name: "create-solid",
	description: "Create a new Solid project",
	args: {
		projectNamePositional: positional({
			type: optional(string),
			displayName: "Project Name",
			description: "The name of the project to be generated",
		}),
		templatePositional: positional({
			type: optional(string),
			displayName: "Template name",
			description: "Name of template to be initialised",
		}),
		projectNameOption: option({
			type: optional(string),
			long: "project-name",
			short: "p",
			description: "Name of your project",
		}),
		solidStart: flag({
			type: optional(boolean),
			long: "solid-start",
			short: "s",
			description: "Create a SolidStart project",
		}),
	},
	handler: async ({ projectNameOption, solidStart, projectNamePositional, templatePositional }) => {
		if (templatePositional && !isTemplate(templatePositional)) {
			console.error(`Template "${templatePositional}" is not supported`);
			process.exit(0);
		}
		try {
			await handleNew({
				template: templatePositional as Template,
				name: projectNamePositional ?? projectNameOption,
				stackblitz: false,
				isStart: solidStart,
			});
		} catch (e) {
			console.error(e);
			process.exit(1);
		}
	},
});
run(app, process.argv.slice(2));
