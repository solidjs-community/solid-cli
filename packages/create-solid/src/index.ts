#! /usr/bin/env node
import color from "picocolors";
import { intro } from "@clack/prompts";
import packageJson from "../package.json" with { type: "json" };
import { defineCommand, runMain } from "citty";
import { createVanillaJS } from "./create-vanilla";

intro(`\n${color.bgCyan(color.black(` Create-Solid v${packageJson.version}`))}`);

const main = defineCommand({
	meta: {
		name: "create-solid",
		version: packageJson.version,
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
	run({ args: { projectNamePositional, templatePositional, "project-name": projectNameOptional, solidstart } }) {
		createVanillaJS({ template: "ts", destination: "./ts" })
	}
})
runMain(main);
