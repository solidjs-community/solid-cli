import { writeFile, readFile } from "@solid-cli/utils/fs";
import { transformPlugins } from "@solid-cli/utils/transform";
import { isSolidStart } from "@solid-cli/utils";
import * as p from "@clack/prompts";
import { cancelable } from "@solid-cli/ui";

export const supportedModes = ["csr", "ssr", "ssg"] as const;
type SupportedModes = (typeof supportedModes)[number];

const handleAutocompleteMode = async () => {
	const mode = (await cancelable(
		p.select({
			message: "Select a mode",
			options: supportedModes.map((a) => ({ value: a, label: a.toUpperCase() })),
		}),
	)) as SupportedModes;
	await handleMode(mode);
};

export const handleMode = async (mode?: SupportedModes) => {
	if (!(await isSolidStart())) {
		p.log.error("Cannot run command. Your project doesn't include solid-start");
		return;
	}
	if (!mode) {
		handleAutocompleteMode();
		return;
	}
	p.log.info("Updating config");
	if (mode != "ssg") {
		const newConfig = await transformPlugins(
			[
				{
					importName: "solid",
					importSource: "solid-start/vite",
					isDefault: true,
					options: { ssr: mode === "ssr" },
				},
			],
			{ name: "vite.config.ts", contents: (await readFile("vite.config.ts")).toString() },
			true,
			true,
		);
		await writeFile("vite.config.ts", newConfig);
	}
};
