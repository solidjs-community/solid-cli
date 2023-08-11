import { transform } from "@swc/core";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

export const transformPlugins = async (
	new_plugins: PluginOptions[],
	force_transform = false,
	merge_configs = false,
	config_path = "vite.config.ts",
	wasm_path = fileURLToPath(
		new URL("../../../swc-plugin-solid-cli/output/swc_plugin_solid_cli.wasm", import.meta.url),
	).replace("transform\\", ""),
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
							additionalPlugins: new_plugins,
							forceTransform: force_transform,
							mergeConfigs: merge_configs,
						},
					],
				],
			},
		},
	});
	return res.code;
};
// All the integrations/packages that we support
// export const supported = ["unocss", "vitepwa", "solid-devtools"] as const;
export type PluginOptions = {
	importName: string;
	importSource: string;
	isDefault: boolean;
	options: object;
};
