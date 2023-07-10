import {
	binary,
	command,
	oneOf,
	positional,
	run,
	string,
	subcommands,
} from "cmd-ts";
import * as p from "@clack/prompts";
import color from "picocolors";
import {
	ConfigTransform,
	resolvePluginConfig,
	supported,
} from "./lib/ConfigTransform";
import { detect } from "detect-package-manager";
import { exec } from "child_process";

const transformer = new ConfigTransform();
const add = command({
	name: "add",
	description: "Can add and install integration: `solid add unocss`",
	args: {
		package_name: positional({
			type: oneOf(supported),
			displayName: "Package Name",
		}),
	},
	handler: async ({ package_name }) => {
		const config = resolvePluginConfig(package_name);
		if (!config) {
			p.log.error(
				"Couldn't resolve your desired package. Maybe we don't support it"
			);
			return;
		}
		await transformer.add_plugins([config]);
		p.log.success("Config updated");
		const pM = await detect();
		const s = p.spinner();
		s.start(`Installing packages via ${pM}`);
		await new Promise((res) =>
			exec(`${pM} i ${config[1].toLowerCase().split("/")[0]}`, res)
		);
		s.stop("Packages installed");
	},
});
const cli = subcommands({
	name: "solid",
	cmds: { add },
});
console.clear();
p.intro(`${color.bgCyan(color.black(" Solid-CLI "))}`);
run(cli, process.argv.slice(2));
