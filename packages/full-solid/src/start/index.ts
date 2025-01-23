import { createRoute } from "@solid-cli/utils";
import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { green } from "picocolors";
export const startCommands = defineCommand({
	meta: { description: "Start-specific commands" }, subCommands: {
		route: defineCommand({
			args: {
				path: {
					type: "positional",
					required: false,
					description: "Route name",
				},
			},
			async run({ args: { path } }) {
				await createRoute(path as string);
				p.log.success(`Route ${green(path as string)} successfully created!`)
			},
		})
	}
});
