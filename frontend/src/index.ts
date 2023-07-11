import {
	boolean,
	command,
	flag,
	oneOf,
	option,
	optional,
	positional,
	restPositionals,
	run,
	string,
	subcommands,
} from "cmd-ts";
import * as p from "@clack/prompts";
import color from "picocolors";
import {
	transform_plugins,
	PluginType,
	resolvePluginConfig,
	supported,
} from "./lib/transform";
import { PM, detect } from "detect-package-manager";
import { exec } from "child_process";
import { openInBrowser } from "./lib/utils/open";
import { start_commands } from "./commands/start";
import { execa } from "execa";
const getRunner = (pM: PM) => {
	switch (pM) {
		case "npm":
			return "npx";
		case "yarn":
			return "npx";
		case "pnpm":
			return "pnpx";
	}
};
const add = command({
	name: "add",
	description: "Can add and install integrations: `solid add unocss`.",
	args: {
		package_name: restPositionals({
			type: oneOf(supported),
			displayName: "Package Name",
		}),
		force_transform: flag({ type: boolean, long: "force", short: "f" }),
	},
	handler: async ({ package_name, force_transform }) => {
		const configs = package_name
			.map((n) => {
				const res = resolvePluginConfig(n);
				if (!res) {
					p.log.error(
						`Can't automatically configure ${n}: we don't support it.`
					);
					return;
				}
				return res;
			})
			.filter((p) => p) as PluginType[];
		await transform_plugins(configs, force_transform);
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
			type: oneOf(["bare", "ts", "js"] as const),
			displayName: "The variation to create, for example `bare`",
			description: "",
		}),
		name: positional({
			type: optional(string),
			displayName: "Project Name",
			description: "The name of the folder to create",
		}),
		stackblitz: flag({ type: boolean, long: "stackblitz", short: "s" }),
	},
	async handler({ variation, name, stackblitz }) {
		if (stackblitz) {
			const s = p.spinner();
			s.start(`Opening ${variation} in browser`);
			await openInBrowser(`https://solid.new/${variation}`);
			s.stop();
			p.log.success("Successfully Opened in Browser");
			return;
		}
		const pM = await detect();
		const { stdout } = await execa(getRunner(pM), [
			"degit",
			`solidjs/templates/${variation}`,
			name ?? "",
		]);
	},
});

const cli = subcommands({
	name: "solid",
	cmds: { add, new: new_, start: start_commands },
});
console.clear();
p.intro(`${color.bgCyan(color.black(" Solid-CLI "))}`);
run(cli, process.argv.slice(2));
