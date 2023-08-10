import { readFile, writeFile } from "fs/promises";
import { homedir } from "../paths";
import { join } from "path";
import { parse, stringify } from "smol-toml";
import { createEffect, createSignal, on } from "@solid-cli/reactivity";
const defaultConfig = {
	lang: Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0],
} as Record<string, any>;
const configPath: string = join(homedir(), "/solid-cli.config.toml");
export const [config, setConfig] = createSignal(defaultConfig);
export const readConfig = async () => {
	try {
		const file = await readFile(configPath, "utf-8");
		setConfig(parse(file));
	} catch {
		await writeConfig();
	}
};
export const writeConfig = async () => {
	await writeFile(configPath, stringify(config()));
};
createEffect(
	on(
		config,
		() => {
			writeConfig();
		},
		{ defer: true },
	),
);
