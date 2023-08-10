import { readFile, writeFile } from "fs/promises";
import { homedir } from "../paths";
import { join } from "path";
import { parse, stringify } from "smol-toml";
import { createSignal } from "@solid-cli/reactivity";
export const PossibleFields = ["lang"] as const;
const defaultConfig = {
	lang: Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0],
} as Record<string, any>;
type Field = (typeof PossibleFields)[number];
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
export const setField = async (field: Field, value: any) => {
	if (!(field in defaultConfig)) {
		throw new Error(`Field ${field} does not exist`);
	}
	setConfig((prev) => ({ ...prev, [field]: value }));
	await writeConfig();
};
export const getField = (field: Field) => {
	if (!config()[field] && defaultConfig[field]) setField(field, defaultConfig[field]);
	return config()[field];
};
