import { transform } from "@swc/core";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { insertAfter, insertAtBeginning } from "./utils/file_ops";
import { fileExists, validateFilePath } from "./utils/helpers";
import { $ } from "execa";
import { detect } from "detect-package-manager";
import { getRunner } from "../command_handlers/new";
import { createSignal } from "@solid-cli/reactivity";
import * as p from "@clack/prompts";
import color from "picocolors";
import { cancelable } from "@solid-cli/ui";

export const transformPlugins = async (
	new_plugins: PluginOptions[],
	force_transform = false,
	merge_configs = false,
	config_path = "vite.config.ts",
	wasm_path = fileURLToPath(new URL("../../../swc-plugin-solid-cli/output/swc_plugin_solid_cli.wasm", import.meta.url)),
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
export type Supported = keyof typeof integrations;
export type PluginOptions = {
	importName: string;
	importSource: string;
	isDefault: boolean;
	options: object;
};

export type IntegrationsValue = {
	pluginOptions?: PluginOptions;
	installs: string[];
	postInstall?: () => Promise<void>;
};

export type Integrations = Record<Supported, IntegrationsValue>;

export const [rootFile, setRootFile] = createSignal<string | undefined>(undefined);

export const integrations = {
	"tailwind": {
		installs: ["tailwindcss", "postcss", "autoprefixer"],
		postInstall: async () => {
			const pM = await detect();
			await $`${getRunner(pM)} tailwindcss init -p`;
			let tailwindConfig = "tailwind.config.js";
			if (!fileExists(tailwindConfig)) {
				p.log.error(color.red(`Can't find tailwind config file`));
				await cancelable(
					p.text({
						message: `Type path to tailwind config: `,
						validate(value) {
							if (!value.length) return `Path can not be empty`;
							const path = validateFilePath(value, "tailwind.config");
							if (!path) return `Tailwind config at \`${value}\` not found. Please try again`;
							else {
								tailwindConfig = path;
							}
						},
					}),
				);
			}

			let indexCss = "./src/index.css";
			if (!fileExists(indexCss)) {
				p.log.error(color.red(`Can't find index.css`));
				await cancelable(
					p.text({
						message: `Type path to index.css: `,
						validate(value) {
							if (!value.length) return `Path can not be empty`;
							const path = validateFilePath(value, "index.css");
							if (!path) return `index.css at \`${value}\` not found. Please try again`;
							else {
								indexCss = path;
							}
						},
					}),
				);
			}
			await insertAfter(tailwindConfig, "content: [", '"./index.html", "./src/**/*.{js,ts,jsx,tsx}"');
			await insertAtBeginning(indexCss, "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
		},
	},
	"unocss": {
		pluginOptions: {
			importName: "UnoCss",
			importSource: "unocss/vite",
			isDefault: true,
			options: {},
		},
		installs: ["unocss"],
		postInstall: async () => {
			const path = rootFile();
			if (!path) return;
			await insertAtBeginning(path, `import "virtual:uno.css";\n`);
		},
	},
	"vitepwa": {
		pluginOptions: {
			importName: "VitePWA",
			importSource: "vite-plugin-pwa",
			isDefault: false,
			options: {},
		},
		installs: ["vite-plugin-pwa"],
	},
	"solid-devtools": {
		pluginOptions: {
			importName: "devtools",
			importSource: "solid-devtools/vite",
			isDefault: true,
			options: {},
		},
		installs: ["solid-devtools"],
		postInstall: async () => {
			const path = rootFile();
			if (!path) return;
			await insertAtBeginning(path, `import "solid-devtools";\n`);
		},
	},
};
