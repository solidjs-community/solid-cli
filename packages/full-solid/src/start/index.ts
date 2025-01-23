import { createRoute } from "@solid-cli/utils";
import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { green } from "picocolors";
import { cancelable } from "@solid-cli/utils/ui"
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
				path ||= await cancelable(p.text({
					message: "Route name", validate(value) {
						if (value.length === 0) return "A route name is required"
					},
				}))
				await createRoute(path as string);
				p.log.success(`Route ${green(path as string)} successfully created!`)
			},
		})
	}
});
