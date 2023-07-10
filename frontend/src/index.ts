import {
	boolean,
	command,
	flag,
	oneOf,
	option,
	positional,
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
import { openInBrowser } from "./lib/open";
import { start_commands } from "./commands/start";

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
				if (!res) {
					p.log.error(
						`Can't automatically configure ${n}: we don't support it`
					);
					return;
				}
				return res;
			})
			.filter((p) => p) as PluginType[];
		await transformer.add_plugins(configs);
		p.log.success("Config updated");
		const pM = await detect();
		const s = p.spinner();
		s.start(`Installing packages via ${pM}`);
		for (let i = 0; i < configs.length; i++) {
			const config = configs[i];
			await new Promise((res) =>
				exec(`${pM} i ${config[1].toLowerCase().split("/")[0]}`, res)
			);
		}
		s.stop("Packages installed");
	},
});
const new_ = command({
	name: "new",
	description: "Creates a new solid project",
	args: {
		variation: positional({
			type: oneOf(["bare"] as const),
			displayName: "The variation to create, for example `bare`",
			description: "",
		}),
		stackblitz: flag({ type: boolean, long: "stackblitz", short: "s" }),
	},
	async handler({ variation, stackblitz }) {
		if (stackblitz) {
			const s = p.spinner();
			s.start(`Opening ${variation} in browser`);
			await openInBrowser(`https://solid.new/${variation}`);
			s.stop();
			p.log.success("Successfully Opened in Browser");
		}
	},
});

const cli = subcommands({
	name: "solid",
	cmds: { add, new: new_, start: start_commands },
});
console.clear();
p.intro(`${color.bgCyan(color.black(" Solid-CLI "))}`);
run(cli, process.argv.slice(2));
