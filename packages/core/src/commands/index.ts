import { openInBrowser } from "@solid-cli/utils";
import { startCommands } from "./start";
import * as p from "@clack/prompts";
import { boolean, command, flag, optional, positional, restPositionals, string } from "cmd-ts";
import { oneOf } from "@solid-cli/utils";
import { cancelable } from "@solid-cli/ui";
import { PossibleFields, setField, t } from "@solid-cli/utils";
import { spinnerify } from "@solid-cli/ui";
import { handleNew, handleAdd } from "@solid-cli/commands";

const add = command({
	name: "add",
	description: t.ADD_DESC,
	args: {
		packages: restPositionals({
			type: string,
			displayName: "Package Name",
		}),
		forceTransform: flag({ type: boolean, long: "force", short: "f" }),
	},
	handler: async ({ packages, forceTransform }) => {
		await handleAdd(packages, forceTransform);
	},
});

const new_ = command({
	name: "new",
	description: t.NEW_DESC,
	args: {
		variation: positional({
			type: optional(oneOf(["ts", "js"] as const)),
			displayName: t.NEW_VARIATION_DESC,
			description: "",
		}),
		name: positional({
			type: optional(string),
			displayName: t.PROJECT_NAME,
			description: t.NEW_NAME_DESC,
		}),
		stackblitz: flag({ type: boolean, long: "stackblitz", short: "s" }),
	},
	async handler({ variation, name, stackblitz }) {
		if (!name && variation) {
			const _name = await cancelable(
				p.text({
					message: t.PROJECT_NAME,
					placeholder: `solid-${variation}`,
					defaultValue: `solid-${variation}`,
				}),
			);
			name = _name;
		}
		await handleNew({ extension: variation, name, stackblitz });
	},
});

const docs = command({
	name: "docs",
	args: {
		keyword: positional({ type: optional(string), displayName: "Keyword" }),
		open: flag({ type: boolean, long: "open", short: "o" }),
	},
	async handler({ keyword, open }) {
		if (!keyword) {
			if (open) {
				await spinnerify({
					startText: "Opening",
					finishText: "Opened",
					fn: () => openInBrowser("https://docs.solidjs.com"),
				});
				return;
			}
			p.log.message("The solid documentation is available at https://docs.solidjs.com");
			return;
		}
		await spinnerify({
			startText: "Opening",
			finishText: "Opened",
			fn: () =>
				openInBrowser(
					`https://www.google.com/search?q=${keyword}+site:docs.solidjs.com+OR+site:start.solidjs.com+OR+site:solidjs.com`,
				),
		});
	},
});

const set = command({
	name: "set",
	args: { field: positional({ type: oneOf(PossibleFields) }), value: positional({ type: string }) },
	async handler({ field, value }) {
		await setField(field, value);
	},
});

const playground = command({
	name: "playground",
	args: {},
	async handler() {
		await spinnerify({
			startText: "Opening",
			finishText: "Opened",
			fn: () => openInBrowser("https://playground.solidjs.com"),
		});
	},
});

export default {
	add,
	docs,
	new: new_,
	set,
	start: startCommands,
	playground,
};
