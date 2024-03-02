#! /usr/bin/env node
import { handleNew } from "@solid-cli/commands/new";
import color from "picocolors";
import { intro } from "@clack/prompts";
import { version } from "../package.json";
import { program } from "commander";
import { t } from "@solid-cli/utils";

intro(`\n${color.bgCyan(color.black(` Create-Solid v${version}`))}`);

program
	.allowExcessArguments(false)
	.configureHelp({
		commandUsage: () => `create-solid [${t.OPTIONS}]`,
	})
	.helpOption(undefined, t.SHOWS_THIS_HELP_MESSAGE)
	.option(`-p, --project-name <${t.VALUE}>`, t.NAME_OF_YOUR_PROJECT)
	.option("-s, --solid-start", t.CREATE_START_PROJECT);

program.parse();
const { projectName, solidStart } = program.opts<{
	projectName?: string;
	solidStart?: boolean;
}>();

handleNew(undefined, projectName, false, solidStart);
