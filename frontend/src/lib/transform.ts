import { transform } from "@swc/core";
import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { insertAtBeginning } from "./utils/file_ops";
import { getProjectRoot } from "./utils/helpers";
//              [importName, importSource, isDefaultImport, options, extraConfig]
// export type PluginType = [string, string, boolean, {}];
export type PluginType = {
	import_name: string;
	import_source: string;
	is_default: boolean;
	options: {};
};
export const transform_plugins = async (
	new_plugins: PluginType[],
	force_transform = false,
	merge_configs = false,
	config_path = "vite.config.ts",
	wasm_path = fileURLToPath(
		new URL("./wasm/transform_config.wasm", import.meta.url)
	)
) => {
	console.log(wasm_path);
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
			return {
				import_name: "UnoCss",
				import_source: "unocss/vite",
				is_default: true,
				options: {},
			};
		case "vitepwa":
			return {
				import_name: "VitePWA",
				import_source: "vite-plugin-pwa",
				is_default: false,
				options: {},
			};
		case "solid-devtools":
			return {
				import_name: "devtools",
				import_source: "solid-devtools/vite",
				is_default: true,
				options: {},
			};
		default:
			return null;
	}
};
export const postInstallActions = {
	unocss: async () => {
		await insertAtBeginning(
			await getProjectRoot(),
			`import "virtual:uno.css";\n`
		);
	},
	"solid-devtools": async () => {
		console.log("Running post-install");
		await insertAtBeginning(
			await getProjectRoot(),
			`import "solid-devtools";\n`
		);
	},
} as const;
