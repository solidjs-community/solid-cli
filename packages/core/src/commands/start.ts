import { command, flag, optional, positional, string, subcommands } from "cmd-ts";
import { oneOf } from "../lib/utils/oneOf";
import { handleMode, supportedModes } from "../command_handlers/start/mode";
import { handleRoute } from "../command_handlers/start/route";
import { handleData } from "../command_handlers/start/data";
import { handleAdapter, supportedAdapters } from "../command_handlers/start/adapter";
import { t } from "../translations";
import { handleApi } from "../command_handlers/start/api";
const mode = command({
	name: "mode",
	args: {
		mode: positional({
			type: optional(oneOf(supportedModes)),
			displayName: "Mode",
			description: t.START_MODE_DESC,
		}),
	},
	async handler({ mode }) {
		await handleMode(mode);
	},
});
const route = command({
	name: "route",
	args: {
		path: positional({ type: optional(string), displayName: "Route Path" }),
		name: positional({
			type: optional(string),
			displayName: "Route name",
			description: t.START_ROUTE_DESC,
		}),
	},
	async handler({ path, name }) {
		await handleRoute(path, name);
	},
});
const data = command({
	name: "data",
	args: {
		path: positional({ type: optional(string), displayName: "Data Path" }),
		name: positional({
			type: optional(string),
			displayName: "Data name",
			description: t.START_DATA_DESC,
		}),
	},
	async handler({ path, name }) {
		await handleData(path, name);
	},
});
const adapter = command({
	name: "adapter",
	args: {
		name: positional({
			type: optional(oneOf(supportedAdapters)),
			displayName: t.START_ADAPTER_DISPLAYNAME,
		}),
		forceTransform: flag({ short: "f", long: "force" }),
	},
	async handler({ name, forceTransform }) {
		await handleAdapter(name, forceTransform);
	},
});

const api = command({
	name: "api",
	args: {
		path: positional({ type: optional(string), displayName: "Api Path" }),
		name: positional({
			type: optional(string),
			displayName: t.START_API_DISPLAYNAME,
			description: t.START_API_HINT,
		}),
	},
	async handler({ path, name }) {
		await handleApi(path, name);
	},
});

export const startCommands = subcommands({
	name: "start",
	description: "Commands specific to solid start",
	cmds: {
		mode,
		route,
		data,
		adapter,
		api,
	},
});
