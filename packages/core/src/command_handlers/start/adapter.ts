import { writeFile } from "fs/promises";
import { transformPlugins } from "../../lib/transform";
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
		[
			{
				importName: "solid",
				importSource: "solid-start/vite",
				isDefault: true,
				options: { adapter: sym },
			},
		],
		forceTransform,
	);
	code = `import ${name} from "solid-start-${name}";\n` + code;
	code = code.replace(`"${sym}"`, `${name}({})`);
	await writeFile("vite.config.ts", code);
};
