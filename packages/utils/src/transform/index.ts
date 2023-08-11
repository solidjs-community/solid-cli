import { transform } from "@swc/core";
import { fileURLToPath } from "url";
export type Config = {
	name: string;
	contents: string;
};
export const transformPlugins = async (
	new_plugins: PluginOptions[],
	config: Config,
	force_transform = false,
	merge_configs = false,
	wasm_path = fileURLToPath(new URL("../../../swc-plugin-solid-cli/output/swc_plugin_solid_cli.wasm", import.meta.url)),
) => {
	const res = await transform(config.contents, {
		filename: config.name,
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
