import { generateCode, parseModule } from "magicast";
import { addVitePlugin } from "magicast/helpers";
import { addPlugins } from "./parse";

export type Config = {
	type: "app" | "vite";
	name: string;
	contents: string;
};

// TODO: Handle case when vite config is a function

export const transformPlugins = async (
	new_plugins: PluginOptions[],
	config: Config,
	_force_transform = false,
	_merge_configs = false,
) => {
	const mod = parseModule(config.contents, { trailingComma: false, flowObjectCommas: false });

	if (config.type === "vite") {
		for (const plugin of new_plugins) {
			addVitePlugin(mod, {
				imported: plugin.isDefault ? "default" : plugin.importName,
				from: plugin.importSource,
				constructor: plugin.importName,
				options: plugin.options,
			});
		}

		return generateCode(mod).code;
	}

	return addPlugins(mod, new_plugins).code;
};
// All the integrations/packages that we support
// export const supported = ["unocss", "vitepwa", "solid-devtools"] as const;
export type PluginOptions = {
	importName: string;
	importSource: string;
	isDefault: boolean;
	options: object;
};
