import { createApi, createRoute } from "@solid-cli/utils";
import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { green } from "picocolors";
import { cancelable } from "@solid-cli/utils/ui";
export const startCommands = defineCommand({
	meta: { description: "Start-specific commands" },
	subCommands: {
		route: defineCommand({
			meta: { description: "Creates a new route" },
			args: {
				path: {
					type: "positional",
					required: false,
					description: "Route path",
				},
				api: {
					type: "boolean",
					required: false,
					default: false,
					alias: "a",
				},
			},
			async run({ args: { path, api } }) {
				path ||= await cancelable(
					p.text({
						message: "Route path",
						validate(value) {
							if (!value || value.length === 0) return "A route path is required";
						},
					}),
				);
				if (api) {
					await createApi(path as string);
				} else {
					await createRoute(path as string);
				}
				p.log.success(`Route ${green(path as string)} successfully created!`);
			},
		}),
	},
});
