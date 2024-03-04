#! /usr/bin/env node
import { handleNew } from "@solid-cli/commands/new";
import color from "picocolors";
import { intro } from "@clack/prompts";
import { version } from "../package.json";
import { command, run, option, string, boolean, flag, optional } from "cmd-ts";

intro(`\n${color.bgCyan(color.black(` Create-Solid v${version}`))}`);

const app = command({
	name: "create-solid",
	description: "Create a new Solid project",
	args: {
		projectName: option({ type: optional(string), long: "project-name", short: "p", description: "Name of your project" }),
		solidStart: flag({
			type: optional(boolean),
			long: "solid-start",
			short: "s",
			description: "Create a SolidStart project",
		}),
	},
	handler: async ({ projectName, solidStart }) => {
		await handleNew(undefined, projectName, false, solidStart);
	},
});
run(app, process.argv.slice(2));
