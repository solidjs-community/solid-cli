import { insertAfter, insertAtBeginning } from "@solid-cli/utils/fs";
import { readFile, writeFile } from "fs/promises";
import { fileExists, validateFilePath } from "./utils/helpers";
import { $ } from "execa";
import { getRunnerCommand, detectPackageManager } from "@solid-cli/utils/package-manager";
import { createSignal } from "@solid-cli/reactivity";
import * as p from "@clack/prompts";
import color from "picocolors";
import { cancelable } from "@solid-cli/ui";
import { PluginOptions } from "@chialab/esbuild-plugin-meta-url";
import { flushQueue } from "@solid-cli/utils/updates";

// All the integrations/packages that we support
export type Supported = keyof typeof integrations;

export type IntegrationsValue = {
	pluginOptions?: PluginOptions;
	installs: string[];
	additionalConfig?: () => Promise<void>;
	postInstall?: () => Promise<void>;
};

export type Integrations = Record<Supported, IntegrationsValue>;

export const [rootFile, setRootFile] = createSignal<string | undefined>(undefined);

export const integrations = {
	"tailwind": {
		installs: ["tailwindcss", "postcss", "autoprefixer"],
		postInstall: async () => {
			const pM = detectPackageManager();
			await $`${getRunnerCommand(pM)} tailwindcss init -p`;
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
			p.log.info("Updating tailwind config");
			await insertAfter(tailwindConfig, "content: [", '"./index.html", "./src/**/*.{js,ts,jsx,tsx}"');
			await insertAtBeginning(indexCss, "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
			// Instantly flush queue
			await flushQueue();
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
		additionalConfig: async () => {
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
		additionalConfig: async () => {
			const path = rootFile();
			if (!path) return;
			await insertAtBeginning(path, `import "solid-devtools";\n`);
		},
	},
	"vitest": {
		installs: [
			"vitest",
			"jsdom",
			"@solidjs/testing-library",
			"@testing-library/user-event",
			"@testing-library/jest-dom",
		],
		additionalConfig: async () => {
			try {
        p.log.info("Adding test script to package.json");
				const packageJsonString = await readFile("package.json", "utf8");
				const packageJson = JSON.parse(packageJsonString);
				if (!/\bvitest\b/.test(packageJson.scripts.test || "")) {
					packageJson.scripts.test = "vitest";
					await writeFile("package.json", JSON.stringify(packageJson, null, 2) + "\n", "utf8");
				}
				const hasTs = fileExists("tsconfig.json");
				if (hasTs) {
          p.log.info("Adding testing types to tsconfig.json");
					const tsConfigString = await readFile("tsconfig.json", "utf8");
					const tsConfig = JSON.parse(tsConfigString);
					if (!tsConfig.compilerOptions) {
						tsConfig.compilerOptions = {};
					}
					tsConfig.compilerOptions.types = [
						...new Set([...(tsConfig.compilerOptions.types || []), "vite/client", "@testing-library/jest-dom"]),
					];
					await writeFile("tsconfig.json", JSON.stringify(tsConfig, null, 2) + "\n", "utf8");
				}
				if (
					packageJson.dependencies["@solidjs/start"] &&
					["ts", "mjs", "cjs", "js"].every(
						(suffix) => !fileExists(`vite.config.${suffix}`) && !fileExists(`vitest.config.${suffix}`),
					)
				) {
          const suffix = hasTs ? "ts" : "mjs";
          p.log.info(`Adding vitest.config.${suffix}`);
					await writeFile(
						`vitest.config.${suffix}`,
						`import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ["development", "browser"],
  },
});
`,
						"utf-8",
					);
				}
			} catch (err) {
				console.error(err);
			}
		},
	},
};
