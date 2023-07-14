import {
	command,
	oneOf,
	optional,
	positional,
	string,
	subcommands,
} from "cmd-ts";
import { isSolidStart } from "../lib/utils/solid_start";
import * as p from "@clack/prompts";
import { transform_plugins } from "../lib/transform";
import { createRoute } from "../lib/start/add_route";
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
		if (mode != "ssg") {
			await transform_plugins(
				[
					{
						import_name: "solid",
						import_source: "solid-start/vite",
						is_default: true,
						options: { ssr: mode === "ssr" },
					},
				],
				true,
				true
			);
		}
	},
});
const route = command({
	name: "route",
	args: {
		path: positional({ type: string, displayName: "Route Path" }),
		name: positional({
			type: optional(string),
			displayName: "Route name",
			description: "The name of the `.tsx` file to be generated",
		}),
	},
	async handler({ path, name }) {
		if (!(await isSolidStart())) {
			p.log.error(
				"Cannot run command. Your project doesn't include solid-start"
			);
			return;
		}
		const s = p.spinner();
		s.start("Creating new route");
		await createRoute(path, name);
		s.stop("Route created");
	},
});
export const start_commands = subcommands({
	name: "start",
	description: "Commands specific to solid start",
	cmds: {
		mode,
		route,
	},
});
