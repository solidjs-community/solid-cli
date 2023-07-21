import { command, flag, optional, positional, string, subcommands } from "cmd-ts";
import { isSolidStart } from "../lib/utils/solid_start";
import * as p from "@clack/prompts";
import { transformPlugins } from "../lib/transform";
import { createRoute } from "../lib/start/add_route";
import { writeFile } from "fs/promises";
import { oneOf } from "../lib/utils/oneOf";
import { createData } from "../lib/start/add_data";
const mode = command({
  name: "mode",
  args: {
    mode: positional({
      type: oneOf(["csr", "ssr", "ssg"] as const),
      displayName: "Mode",
      description: "The rendering mode for solid to build for, and use.",
    }),
  },
  async handler({ mode }) {
    if (!(await isSolidStart())) {
      p.log.error("Cannot run command. Your project doesn't include solid-start");
      return;
    }
    p.log.info("Updating config");
    if (mode != "ssg") {
      await transformPlugins(
        [
          {
            importName: "solid",
            importSource: "solid-start/vite",
            isDefault: true,
            options: { ssr: mode === "ssr" },
          },
        ],
        true,
        true,
      );
    }
  },
});
const route = command({
  name: "route",
  args: {
    path: positional({ type: string, displayName: "Route Path" }),
    name: positional({
      type: optional(string),
      displayName: "Route name",
      description: "The name of the `.tsx` file to be generated",
    }),
  },
  async handler({ path, name }) {
    if (!(await isSolidStart())) {
      p.log.error("Cannot run command. Your project doesn't include solid-start");
      return;
    }
    const s = p.spinner();
    s.start("Creating new route");
    await createRoute(path, name);
    s.stop("Route created");
  },
});
const data = command({
  name: "data",
  args: {
    path: positional({ type: string, displayName: "Data Path" }),
    name: positional({
      type: optional(string),
      displayName: "Data name",
      description: "The name of the `.data.ts` file to be generated",
    }),
  },
  async handler({ path, name }) {
    if (!(await isSolidStart())) {
      p.log.error("Cannot run command. Your project doesn't include solid-start");
      return;
    }
    const s = p.spinner();
    s.start("Creating new route");
    await createData(path, name);
    s.stop("Route created");
  },
});
const supportedAdapters = [
  "aws",
  "cloudflare-pages",
  "cloudflare-workers",
  "deno",
  "netlify",
  "node",
  "static",
  "vercel",
] as const;
const adapter = command({
  name: "adapter",
  args: {
    name: positional({
      type: oneOf(supportedAdapters),
      displayName: "Adapter name",
    }),
    forceTransform: flag({ short: "f", long: "force" }),
  },
  async handler({ name, forceTransform }) {
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
