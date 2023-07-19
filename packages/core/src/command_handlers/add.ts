import { writeFile } from "fs/promises";
import { autocomplete } from "../components/autocomplete/autocomplete";
import { S_BAR } from "../components/autocomplete/utils";
import { Integrations, Supported, integrations, transformPlugins } from "../lib/transform";
import * as p from "@clack/prompts";
import color from "picocolors";
import { detect } from "detect-package-manager";
import { $ } from "execa";
import { loadPrimitives } from "../lib/utils/primitives";
import { primitives } from "../lib/utils/primitives";
const handleAutocompleteAdd = async () => {
  const supportedIntegrations = (Object.keys(integrations) as Supported[]).map((value) => ({ label: value, value }));
  const opts = () => [...supportedIntegrations, ...primitives()];
  loadPrimitives().catch((e) => p.log.error(e));
  const a = await autocomplete({
    message: "Add packages",
    options: opts,
  });

  if (p.isCancel(a)) {
    p.log.warn("Canceled");
    return;
  }

  if (a.length === 0) {
    p.log.warn("Nothing selected");
    return;
  }
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

  if (p.isCancel(shouldInstall)) {
    p.log.warn("Canceled");
    return;
  }

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
    configs.map((c) => c.pluginOptions),
    forceTransform,
  );
  await writeFile("vite.config.ts", code);
  p.log.success("Config updated");
  configs.forEach(async (cfg) => {
    await cfg.postInstall?.();
  });
  const pM = await detect();
  // Check primitives are valid
  const s = p.spinner();
  s.start(`Installing packages via ${pM}`);
  // Install plugins
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];

    const { stdout } = await $`${pM} i ${config.pluginOptions.importSource.toLowerCase().split("/")[0]}`;
  }
  // Install primitives
  for (const primitive of await transformPrimitives(possiblePrimitives)) {
    const { stdout } = await $`${pM} i ${primitive.value}`;
  }
  s.stop("Packages installed");
};
