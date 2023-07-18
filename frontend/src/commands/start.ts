import { command, flag, optional, positional, string, subcommands } from "cmd-ts";
import { isSolidStart } from "../lib/utils/solid_start";
import * as p from "@clack/prompts";
import { transform_plugins } from "../lib/transform";
import { createRoute } from "../lib/start/add_route";
import { writeFile } from "fs/promises";
import { oneOf } from "../lib/utils/oneOf";
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
      await transform_plugins(
        [
          {
            import_name: "solid",
            import_source: "solid-start/vite",
            is_default: true,
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
    force_transform: flag({ short: "f", long: "force" }),
  },
  async handler({ name, force_transform }) {
    const sym = Symbol(name).toString();
    let code = await transform_plugins(
      [
        {
          import_name: "solid",
          import_source: "solid-start/vite",
          is_default: true,
          options: { adapter: sym },
        },
      ],
      force_transform,
    );
    code = `import ${name} from "solid-start-${name}";\n` + code;
    code = code.replace(`"${sym}"`, `${name}({})`);
    await writeFile("vite.config.ts", code);
  },
});
export const start_commands = subcommands({
  name: "start",
  description: "Commands specific to solid start",
  cmds: {
    mode,
    route,
    adapter,
  },
});
