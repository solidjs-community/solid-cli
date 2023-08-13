import { insertAfter, insertAtBeginning } from "./utils/file_ops";
import { fileExists, validateFilePath } from "./utils/helpers";
import { $ } from "execa";
import { detect } from "detect-package-manager";
import { getRunner } from "../command_handlers/new";
import { createSignal } from "@solid-cli/reactivity";
import * as p from "@clack/prompts";
import color from "picocolors";
import { cancelable } from "@solid-cli/ui";
import { PluginOptions } from "@chialab/esbuild-plugin-meta-url";
import { queueUpdate } from "@solid-cli/utils/updates";

// All the integrations/packages that we support
export type Supported = keyof typeof integrations;

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
			queueUpdate({ type: "command", name: `${getRunner(pM)} tailwindcss init -p` });
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
