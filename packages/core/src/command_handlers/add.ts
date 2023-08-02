import { writeFile } from "fs/promises";
import { autocomplete } from "../components/autocomplete/autocomplete";
import { S_BAR, cancelable } from "../components/autocomplete/utils";
import { Integrations, PluginOptions, Supported, integrations, transformPlugins } from "../lib/transform";
import * as p from "@clack/prompts";
import color from "picocolors";
import { detect } from "detect-package-manager";
import { $ } from "execa";
import { loadPrimitives } from "../lib/utils/primitives";
import { primitives } from "../lib/utils/primitives";
import { t } from "../translations";
const handleAutocompleteAdd = async () => {
  const supportedIntegrations = (Object.keys(integrations) as Supported[]).map((value) => ({ label: value, value }));
  const opts = () => [...supportedIntegrations, ...primitives()];
  loadPrimitives().catch((e) => p.log.error(e));
  const a = await cancelable(
    autocomplete({
      message: "Add packages",
      options: opts,
    }),
  );

  if (a.length === 0) {
    p.log.warn("Nothing selected");
    return;
  }
  const shouldInstall = await cancelable<unknown>(
    p.select({
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
        { label: "Yes (force)", value: [true, "force"] },
      ],
      message: `${t.CONFIRM_INSTALL(a.length)} \n${color.red(S_BAR)} \n${color.red(S_BAR)}  ${
        " " + color.yellow(a.map((opt) => opt.label).join(" ")) + " "
      } \n${color.red(S_BAR)} `,
    }),
  );

  if (!shouldInstall) return;

  let forceTransform = false;
  if (Array.isArray(shouldInstall) && shouldInstall[1] === "force") {
    forceTransform = true;
  }
  const packages = a.map((opt) => opt.value as Supported);

  return { packages, forceTransform };
};
const isIntegration = (str: string) => {
  if (Object.keys(integrations).includes(str)) return true;
  return false;
};
/**
 * Transforms a list containing primitives, either by name or full package name, and returns the corresponding primitive objects
 */
const transformPrimitives = async (ps: string[]) => {
  if (!ps.length) return [];
  if (!primitives().length) {
    const s = p.spinner();
    s.start("Loading primitives");
    await loadPrimitives();
    s.stop("Primitives loaded");
  }
  const mappedInput = ps.map((p) => p.replace("@solid-primitives/", ""));
  return primitives().filter((p) => mappedInput.includes(p.value.replace("@solid-primitives/", "")));
};
type Configs = Integrations[keyof Integrations][];
export const handleAdd = async (packages?: string[], forceTransform: boolean = false) => {
  if (!packages?.length) {
    const autocompleted = await handleAutocompleteAdd();

    if (!autocompleted) return;

    packages = autocompleted.packages;
    forceTransform = autocompleted.forceTransform;
  }
  const possiblePrimitives: string[] = [];
  const configs: Configs = packages
    .map((n) => {
      if (!n) return;
      if (!isIntegration(n)) {
        possiblePrimitives.push(n);
        return;
      }
      const res = integrations[n as Supported];
      if (!res) {
        p.log.error(`Can't automatically configure ${n}: we don't support it.`);
        return;
      }
      return res;
    })
    .filter((p) => p) as Configs;

  const code = await transformPlugins(
    configs.map((c) => c.pluginOptions).filter(Boolean) as PluginOptions[],
    forceTransform,
  );
  await writeFile("vite.config.ts", code);
  p.log.success("Config updated");
  const pM = await detect();

  const s = p.spinner();
  s.start(`Installing packages via ${pM}`);
  // Install plugins
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];

    await $`${pM} install ${config.installs}`;
  }
  // Install primitives
  for (const primitive of await transformPrimitives(possiblePrimitives)) {
    await $`${pM} install ${primitive.value}`;
  }
  s.stop("Packages installed");

  s.start("Running post install steps");

  for (const cfg of configs) {
    await cfg.postInstall?.();
  }

  s.stop("Post install complete");
};
