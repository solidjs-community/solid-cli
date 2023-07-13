import { transform } from "@swc/core";
import { readFile, writeFile } from "fs/promises";
//              [importName, importSource, isDefaultImport, options]
export type PluginType = [string, string, boolean, {}];
export const transform_plugins = async (
	new_plugins: PluginType[],
	force_transform = false,
	merge_configs = false,
	config_path = "vite.config.ts",
	wasm_path = new URL(
		"./wasm/transform_config.wasm",
		import.meta.url
	).pathname.slice(1)
) => {
	const configData = (await readFile(config_path)).toString();
	const res = await transform(configData, {
		filename: config_path,
		jsc: {
			parser: {
				syntax: "typescript",
				tsx: false,
			},
			target: "es2022",
			experimental: {
				plugins: [
					[
						wasm_path,
						{
							additional_plugins: new_plugins,
							force_transform,
							merge_configs,
						},
					],
				],
			},
		},
	});
	await writeFile(config_path, res.code);
};
// All the integrations/packages that we support
export const supported = ["unocss", "vitepwa", "solid-devtools"] as const;
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
