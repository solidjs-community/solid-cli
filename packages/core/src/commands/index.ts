import { PM, detect } from "detect-package-manager";
import { openInBrowser } from "../lib/utils/open";
import { startCommands } from "./start";
import * as p from "@clack/prompts";
import { execa } from "execa";
import { boolean, command, flag, optional, positional, restPositionals, string } from "cmd-ts";
import { oneOf } from "../lib/utils/oneOf";
import { handleAdd } from "../command_handlers/add";
import { handleNew } from "../command_handlers/new";
import { cancelable } from "../components/autocomplete/utils";
import { t } from "../translations";

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
      type: optional(oneOf(["bare", "ts", "js"] as const)),
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
    await handleNew(variation, name, stackblitz);
  },
});
const docs = command({
  name: "docs",
  args: {
    open: flag({ type: boolean, long: "open", short: "o" }),
  },
  async handler({ open }) {
    if (open) {
      await openInBrowser("https://docs.solidjs.com");
      return;
    }
    p.log.message("The solid documentation is available at https://docs.solidjs.com");
  },
});
export default {
  add,
  docs,
  new: new_,
  start: startCommands,
};
