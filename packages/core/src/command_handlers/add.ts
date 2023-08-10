import { autocomplete } from "@solid-cli/ui";
import { S_BAR, cancelable } from "@solid-cli/ui";
import {
	Integrations,
	PluginOptions,
	Supported,
	integrations,
	setProjectRoot,
	transformPlugins,
} from "../lib/transform";
import * as p from "@clack/prompts";
import color from "picocolors";
import { detect } from "detect-package-manager";
import { $ } from "execa";
import { loadPrimitives } from "../lib/utils/primitives";
import { primitives } from "../lib/utils/primitives";
import { t } from "@solid-cli/utils";
import { spinnerify } from "../lib/utils/ui";
import { fileExists, getProjectRoot, validateFilePath } from "../lib/utils/helpers";
import { writeFile } from "fs/promises";

const getViteConfig = async () => {
	let config = "vite.config.ts";

	const exists = fileExists(config);

	if (!exists) {
		p.log.error(color.red(`Can't find vite config`));
		await cancelable(
			p.text({
				message: "Type path to vite config: ",
				validate(value) {
					const path = validateFilePath(value, "vite.config");
					if (!path) return `Vite config not found. Please try again`;
					else {
						config = path;
					}
				},
			}),
		);
	}

	return config;
};

const handleAutocompleteAdd = async () => {
	const supportedIntegrations = (Object.keys(integrations) as Supported[]).map((value) => ({ label: value, value }));
	const opts = () => [...supportedIntegrations, ...primitives()];
	loadPrimitives().catch((e) => p.log.error(e));
	const a = await cancelable(
		autocomplete({
			message: t.ADD_PACKAGES,
			options: opts,
		}),
	);

	if (a.length === 0) {
		p.log.warn(t.NOTHING_SELECTED);
		return;
	}
	const shouldInstall = await cancelable<unknown>(
		p.select({
			options: [
				{ label: t.YES, value: true },
				{ label: t.NO, value: false },
				{ label: t.YES_FORCE, value: [true, "force"] },
			],
			message: `${t.CONFIRM_INSTALL(a.length)} \n${color.red(S_BAR)} \n${color.red(S_BAR)}  ${
				" " + color.yellow(a.map((opt) => opt.label).join(" ")) + " "
			} \n${color.red(S_BAR)} `,
		}),
	);

	if (!shouldInstall) return;

	let forceTransform = false;
	if (Array.isArray(shouldInstall) && shouldInstall[1] === "force") {
		forceTransform = true;
	}
	const packages = a.map((opt) => opt.value as Supported);

	return { packages, forceTransform };
};
const isIntegration = (str: string) => {
	if (Object.keys(integrations).includes(str)) return true;
	return false;
};
/**
 * Transforms a list containing primitives, either by name or full package name, and returns the corresponding primitive objects
 */
const transformPrimitives = async (ps: string[]) => {
	if (!ps.length) return [];
	if (!primitives().length) {
		await spinnerify({
			startText: t.LOADING_PRIMITIVES,
			finishText: t.PRIMITIVES_LOADED,
			fn: loadPrimitives,
		});
	}
	const mappedInput = ps.map((p) => p.replace("@solid-primitives/", ""));
	return primitives().filter((p) => mappedInput.includes(p.value.replace("@solid-primitives/", "")));
};
type Configs = Integrations[keyof Integrations][];
export const handleAdd = async (packages?: string[], forceTransform: boolean = false) => {
	if (!packages?.length) {
		const autocompleted = await handleAutocompleteAdd();

		if (!autocompleted) return;

		packages = autocompleted.packages;
		forceTransform = autocompleted.forceTransform;
	}
	const possiblePrimitives: string[] = [];
	const configs: Configs = packages
		.map((n) => {
			if (!n) return;
			if (!isIntegration(n)) {
				possiblePrimitives.push(n);
				return;
			}
			const res = integrations[n as Supported];
			if (!res) {
				p.log.error(t.NO_SUPPORT(n));
				return;
			}
			return res;
		})
		.filter((p) => p) as Configs;

	const viteConfig = await getViteConfig();

	const code = await transformPlugins(
		configs.map((c) => c.pluginOptions).filter(Boolean) as PluginOptions[],
		forceTransform,
		undefined,
		viteConfig,
	);
	await writeFile(viteConfig, code);
	p.log.success(t.CONFIG_UPDATED);
	const pM = await detect();
	await spinnerify([
		{
			startText: t.INSTALLING_VIA(pM),
			finishText: t.PACKAGES_INSTALLED,
			fn: async () => {
				for (let i = 0; i < configs.length; i++) {
					const config = configs[i];
					await $`${pM} install ${config.installs}`;
				}
				// Install primitives
				for (const primitive of await transformPrimitives(possiblePrimitives)) {
					await $`${pM} install ${primitive.value}`;
				}
			},
		},
	]);
	p.log.info("Preparing post install steps");
	let projectRoot = await getProjectRoot();

	if (!fileExists(projectRoot)) {
		p.log.error(color.red(`Can't find root file \`${projectRoot.split("/")[1]}\`.`));
		await cancelable(
			p.text({
				message: `Type path to root: `,
				validate(value) {
					if (!value.length) return `Path can not be empty`;
					const path = validateFilePath(value, ["root.tsx", "index.tsx"]);
					if (!path) return `File at \`${value}\` not found. Please try again`;
					else {
						setProjectRoot(path);
					}
				},
			}),
		);
	}
	await spinnerify({
		startText: t.POST_INSTALL,
		finishText: t.POST_INSTALL_COMPLETE,
		fn: async () => {
			for (const cfg of configs) {
				await cfg.postInstall?.();
			}
		},
	});
};
