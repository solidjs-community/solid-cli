import { transform } from "@swc/core";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { insertAfter, insertAtBeginning } from "./utils/file_ops";
import { getProjectRoot } from "./utils/helpers";
import { $ } from "execa";
import { detect } from "detect-package-manager";
import { getRunner } from "../command_handlers/new";

export const transformPlugins = async (
  new_plugins: PluginOptions[],
  force_transform = false,
  merge_configs = false,
  config_path = "vite.config.ts",
  wasm_path = fileURLToPath(new URL("../../../swc-plugin-solid-cli/output/swc_plugin_solid_cli.wasm", import.meta.url)),
) => {
  const configData = (await readFile(config_path)).toString();
  const res = await transform(configData, {
    filename: config_path,
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: false,
      },
      target: "es2022",
      experimental: {
        plugins: [
          [
            wasm_path,
            {
              additionalPlugins: new_plugins,
              forceTransform: force_transform,
              mergeConfigs: merge_configs,
            },
          ],
        ],
      },
    },
  });
  return res.code;
};
// All the integrations/packages that we support
// export const supported = ["unocss", "vitepwa", "solid-devtools"] as const;
export type Supported = keyof typeof integrations;
export type PluginOptions = {
  importName: string;
  importSource: string;
  isDefault: boolean;
  options: object;
};

export type IntegrationsValue = {
  pluginOptions?: PluginOptions;
  installs: string[];
  postInstall?: () => Promise<void>;
};

export type Integrations = Record<Supported, IntegrationsValue>;

export const integrations = {
  "tailwind": {
    installs: ["tailwindcss", "postcss", "autoprefixer"],
    postInstall: async () => {
      const pM = await detect();
      await $`${getRunner(pM)} tailwindcss init -p`;
      await insertAfter("tailwind.config.js", "content: [", '"./index.html", "./src/**/*.{js,ts,jsx,tsx}"');
      await insertAtBeginning("./src/index.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
    },
  },
  "unocss": {
    pluginOptions: {
      importName: "UnoCss",
      importSource: "unocss/vite",
      isDefault: true,
      options: {},
    },
    installs: ["unocss"],
    postInstall: async () => {
      await insertAtBeginning(await getProjectRoot(), `import "virtual:uno.css";\n`);
    },
  },
  "vitepwa": {
    pluginOptions: {
      importName: "VitePWA",
      importSource: "vite-plugin-pwa",
      isDefault: false,
      options: {},
    },
    installs: ["vite-plugin-pwa"],
    postInstall: async () => {
      await insertAtBeginning(await getProjectRoot(), `import "solid-devtools";\n`);
    },
  },
  "solid-devtools": {
    pluginOptions: {
      importName: "devtools",
      importSource: "solid-devtools/vite",
      isDefault: true,
      options: {},
    },
    installs: ["solid-devtools"],
  },
};
