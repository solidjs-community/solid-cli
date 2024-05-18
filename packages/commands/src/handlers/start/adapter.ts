import { readFile, writeFile } from "@solid-cli/utils/fs";
import { transformPlugins } from "@solid-cli/utils/transform";
import * as p from "@clack/prompts";
import { cancelable } from "@solid-cli/ui";

export const supportedAdapters = [
	"aws",
	"cloudflare-pages",
	"cloudflare-workers",
	"deno",
	"netlify",
	"node",
	"static",
	"vercel",
] as const;

type SupportedAdapters = (typeof supportedAdapters)[number];

const handleAutocompleteAdapter = async () => {
	const name = (await cancelable(
		p.select({
			message: "Select an adapter",
			options: supportedAdapters.map((a) => ({ value: a, label: a })),
		}),
	)) as SupportedAdapters;
	await handleAdapter(name, true);
};

export const handleAdapter = async (name?: string, forceTransform = false) => {
	if (!name) {
		await handleAutocompleteAdapter();
		return;
	}
	const sym = Symbol(name).toString();
	let code = await transformPlugins(
		[],
		{ type: "app", name: "app.config.ts", contents: (await readFile("app.config.ts")).toString() },
		forceTransform,
	);
	code = `import ${name} from "solid-start-${name}";\n` + code;
	code = code.replace(`"${sym}"`, `${name}({})`);
	await writeFile("app.config.ts", code);
};
