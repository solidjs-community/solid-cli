import { run, subcommands } from "cmd-ts";
import * as p from "@clack/prompts";
import color from "picocolors";
import commands from "./plugins/plugins_entry";
const cli = subcommands({
	name: "solid",
	cmds: commands,
});
console.clear();
p.intro(`${color.bgCyan(color.black(" Solid-CLI "))}`);
run(cli, process.argv.slice(2));
