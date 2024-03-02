#! /usr/bin/env node
import { handleNew } from "@solid-cli/commands/new";
import color from "picocolors";
import { intro } from "@clack/prompts";
import { version } from "../package.json";
import { program } from "commander";

intro(`\n${color.bgCyan(color.black(` Create-Solid v${version}`))}`);

program
	.allowExcessArguments(false)
	.configureHelp({
		commandUsage: () => "create-solid [options]",
	})
	.helpOption(undefined, "Shows this help message")
	.option("-p, --project-name <VALUE>", "The name of your project")
	.option("-s, --solid-start", "Create a SolidStart project");

program.parse();
const { projectName, solidStart } = program.opts<{
	projectName?: string;
	solidStart?: boolean;
}>();

handleNew(undefined, projectName, false, solidStart);
