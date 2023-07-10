import {
	command,
	oneOf,
	restPositionals,
	run,
	subcommands,
} from "cmd-ts";
import * as p from "@clack/prompts";
import color from "picocolors";
import {
	ConfigTransform,
	PluginType,
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
		package_name: restPositionals({
			type: oneOf(supported),
			displayName: "Package Name",
		}),
	},
	handler: async ({ package_name }) => {
		const configs = package_name
			.map((n) => {
				const res = resolvePluginConfig(n);
				if (res === null) {
					p.log.error(
						`Can't automatically configure ${n}: we don't support it`
					);
				}
				return res;
			})
			.filter((p) => p !== null) as PluginType[];
		await transformer.add_plugins(configs);
		p.log.success("Config updated");
		const pM = await detect();
		const s = p.spinner();
		s.start(`Installing packages via ${pM}`);
		for (const config in configs) {
			await new Promise((res) =>
				exec(`${pM} i ${config[1].toLowerCase().split("/")[0]}`, res)
			);
		}
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
