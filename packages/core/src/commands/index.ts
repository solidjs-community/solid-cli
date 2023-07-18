import { PM, detect } from "detect-package-manager";
import { openInBrowser } from "../lib/utils/open";
import { start_commands } from "./start";
import * as p from "@clack/prompts";
import { execa } from "execa";
import { boolean, command, flag, optional, positional, restPositionals, string } from "cmd-ts";
import { Supported, integrations } from "../lib/transform";
import { oneOf } from "../lib/utils/oneOf";
import { handleAdd } from "../command_handlers/add";

const getRunner = (pM: PM) => {
  switch (pM) {
    case "npm":
      return "npx";
    case "yarn":
      return "npx";
    case "pnpm":
      return "pnpx";
  }
};
const add = command({
  name: "add",
  description: "Can add and install integrations: `solid add unocss`.",
  args: {
    package_name: restPositionals({
      type: oneOf(Object.keys(integrations) as Supported[]),
      displayName: "Package Name",
    }),
    force_transform: flag({ type: boolean, long: "force", short: "f" }),
  },
  handler: async ({ package_name, force_transform }) => {
    await handleAdd(package_name, force_transform);
  },
});
const new_ = command({
  name: "new",
  description: "Creates a new solid project",
  args: {
    variation: positional({
      type: oneOf(["bare", "ts", "js"] as const),
      displayName: "The variation to create, for example `bare`",
      description: "",
    }),
    name: positional({
      type: optional(string),
      displayName: "Project Name",
      description: "The name of the folder to create",
    }),
    stackblitz: flag({ type: boolean, long: "stackblitz", short: "s" }),
  },
  async handler({ variation, name, stackblitz }) {
    if (stackblitz) {
      const s = p.spinner();
      s.start(`Opening ${variation} in browser`);
      await openInBrowser(`https://solid.new/${variation}`);
      s.stop();
      p.log.success("Successfully Opened in Browser");
      return;
    }
    const pM = await detect();
    const { stdout } = await execa(
      getRunner(pM),
      ["degit", `solidjs/templates/${variation}`, name ?? null].filter((e) => e !== null) as string[],
    );
  },
});
export default {
  add,
  new: new_,
  start: start_commands,
};
