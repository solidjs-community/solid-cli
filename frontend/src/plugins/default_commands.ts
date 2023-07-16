import { PM, detect } from "detect-package-manager";
import { openInBrowser } from "../lib/utils/open";
import { start_commands } from "../commands/start";
import * as p from "@clack/prompts";
import color from "picocolors";

import { $ } from "execa";
import { autocomplete } from "../autocomplete/autocomplete";
import { S_BAR } from "../autocomplete/utils";
import { execa } from "execa";
import { boolean, command, flag, oneOf, optional, positional, restPositionals, string } from "cmd-ts";
import { PluginType, postInstallActions, resolvePluginConfig, supported, transform_plugins } from "../lib/transform";
import { writeFile } from "fs/promises";
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
      type: oneOf(supported),
      displayName: "Package Name",
    }),
    force_transform: flag({ type: boolean, long: "force", short: "f" }),
  },
  handler: async ({ package_name, force_transform }) => {
    console.log(package_name, force_transform);
    let configs: PluginType[] = [];
    if (!package_name.length) {
      console.log("Inside autocomplete");
      const a = await autocomplete({
        message: "Add packages",
        options: supported.map((value) => ({ label: value, value })),
      });

      if (typeof a === "object") {
        if (a.length === 0) return;
        const shouldInstall = await p.select({
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
            { label: "Yes (force)", value: [true, "force"] },
          ],
          message: `Install the following (${a.length}) packages? \n${color.red(S_BAR)} \n${color.red(S_BAR)}  ${
            " " + color.yellow(a.map((opt) => opt.label).join(" ")) + " "
          } \n${color.red(S_BAR)} `,
        });

        if (!shouldInstall) return;

        console.log("inside autocomplete force");
        if (Array.isArray(shouldInstall) && shouldInstall[1] === "force") {
          force_transform = true;
        }

        configs = a
          .map((opt) => {
            const n = opt.value;
            if (!n) return;
            console.log(n);
            const res = resolvePluginConfig(n);
            if (!res) {
              p.log.error(`Can't automatically configure ${n}: we don't support it.`);
              return;
            }
            return res;
          })
          .filter((p) => p) as PluginType[];
      }
    } else {
      configs = package_name
        .map((n) => {
          if (!n) return;
          const res = resolvePluginConfig(n);
          if (!res) {
            p.log.error(`Can't automatically configure ${n}: we don't support it.`);
            return;
          }
          return res;
        })
        .filter((p) => p) as PluginType[];
    }
    const code = await transform_plugins(configs, force_transform);
    await writeFile("vite.config.ts", code);
    p.log.success("Config updated");
    configs.forEach(async (cfg) => {
      await postInstallActions[cfg.import_source.split("/")[0].toLowerCase() as keyof typeof postInstallActions]?.();
    });
    const pM = await detect();
    const s = p.spinner();
    s.start(`Installing packages via ${pM}`);
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];

      const { stdout } = await $`${pM} i ${config.import_source.toLowerCase().split("/")[0]}`;
    }
    s.stop("Packages installed");
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
