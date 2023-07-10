import * as p from "@clack/prompts";
import color from "picocolors";
import { transform } from "@swc/core";
import { readFile, writeFile } from "fs/promises";
import { exec } from "child_process";
import { detect } from "detect-package-manager";
const resolvePluginConfig = (
	packageName: string
): [string, string, boolean] | null => {
	switch (packageName.toLowerCase()) {
		case "unocss":
			return ["UnoCss", "unocss/vite", true];
		case "vitepwa":
			return ["VitePWA", "vite-plugin-pwa", false];
		default:
			return null;
	}
};
async function main() {
	console.clear();
	p.intro(`${color.bgCyan(color.black(" Solid-CLI "))}`);
	const depsToAdd = (await p.multiselect({
		options: [
			{
				value: "unocss",
				label: "UnoCSS",
				hint: "Utility Class CSS library, similar to Tailwind",
			},
			{
				value: "vitepwa",
				label: "VitePWA",
				hint: "Minimal config PWA utility",
			},
		],
		message: "What would you like to add",
		required: true,
	})) as string[];
	const configData = (await readFile("vite.config.ts")).toString();
	// Windows path hack. Not sure if this'll work on other platforms
	const wasm_path = new URL(
		"transform_config.wasm",
		import.meta.url
	).pathname.slice(1);
	const extra_plugins = depsToAdd.map((dep) => resolvePluginConfig(dep));
	const res = await transform(configData, {
		filename: "vite.config.ts",
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
							additional_plugins: extra_plugins,
						},
					],
				],
			},
		},
	});
	await writeFile("vite.config.ts", res.code);
	p.log.success("Updated config");
	p.log.info("Detecting package manager");
	const manager = await detect();
	const s = p.spinner();
	s.start(`Installing plugins via ${manager}`);
	for (const plugin of extra_plugins) {
		if (!plugin) continue;
		const res = await new Promise((res) =>
			exec(`${manager} i ${plugin[1].toLowerCase().split("/")[0]}`, res)
		);
	}
	s.stop("Installed plugins");
}

main().catch(console.error);
