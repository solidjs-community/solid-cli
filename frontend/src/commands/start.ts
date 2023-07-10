import { command, oneOf, positional, subcommands } from "cmd-ts";
import { isSolidStart } from "../lib/core";
import * as p from "@clack/prompts";
import { ConfigTransform } from "../lib/ConfigTransform";
const transformer = new ConfigTransform();
const mode = command({
	name: "mode",
	args: {
		mode: positional({
			type: oneOf(["csr", "ssr", "ssg"] as const),
			displayName: "Mode",
			description: "The rendering mode for solid to build for, and use.",
		}),
	},
	async handler({ mode }) {
		if (!(await isSolidStart())) {
			p.log.error(
				"Cannot run command. Your project doesn't include solid-start"
			);
			return;
		}
		p.log.info("Updating config");
		switch (mode) {
			case "csr":
				break;
			case "ssr":
				break;
			case "ssg":
				break;
		}
	},
});
export const start_commands = subcommands({
	name: "start",
	cmds: {
		mode,
	},
});
