import { transform } from "@swc/core";
import { readFile, writeFile } from "fs/promises";
//              [importName, importSource, isDefaultImport, options]
export type PluginType = [string, string, boolean, {}];
// Written as a class to allow for additional functionality in the future
export class ConfigTransform {
	wasm_path: string;
	config_path: string;
	constructor(
		config_path = "vite.config.ts",
		wasm_path = "../transform_config.wasm"
	) {
		this.wasm_path = new URL(wasm_path, import.meta.url).pathname.slice(1);
		this.config_path = config_path;
	}
	async add_plugins(new_plugins: PluginType[]) {
		const configData = (await readFile(this.config_path)).toString();
		const res = await transform(configData, {
			filename: this.config_path,
			jsc: {
				parser: {
					syntax: "typescript",
					tsx: false,
				},
				target: "es2022",
				experimental: {
					plugins: [
						[
							this.wasm_path,
							{
								additional_plugins: new_plugins,
							},
						],
					],
				},
			},
		});
		await writeFile(this.config_path, res.code);
	}
}
// All the integrations/packages that we support
export const supported = ["unocss", "vitepwa", "solid-devtools"];
export const resolvePluginConfig = (packageName: string): PluginType | null => {
	switch (packageName.toLowerCase()) {
		case "unocss":
			return ["UnoCss", "unocss/vite", true, {}];
		case "vitepwa":
			return ["VitePWA", "vite-plugin-pwa", false, {}];
		case "solid-devtools":
			return ["devtools", "solid-devtools/vite", true, {}];
		default:
			return null;
	}
};
