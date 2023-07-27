import { command, flag, optional, positional, string, subcommands } from "cmd-ts";
import { oneOf } from "../lib/utils/oneOf";
import { handleMode, supportedModes } from "../command_handlers/start/mode";
import { handleRoute } from "../command_handlers/start/route";
import { handleData } from "../command_handlers/start/data";
import { handleAdapter, supportedAdapters } from "../command_handlers/start/adapter";
const mode = command({
  name: "mode",
  args: {
    mode: positional({
      type: optional(oneOf(supportedModes)),
      displayName: "Mode",
      description: "The rendering mode for solid to build for, and use.",
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
      description: "The name of the `.tsx` file to be generated",
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
      description: "The name of the `.data.ts` file to be generated",
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
      displayName: "Adapter name",
    }),
    forceTransform: flag({ short: "f", long: "force" }),
  },
  async handler({ name, forceTransform }) {
    await handleAdapter(name, forceTransform);
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
  },
});
