import { transform } from "@swc/core";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { insertAtBeginning } from "./utils/file_ops";
import { getProjectRoot } from "./utils/helpers";
export const transformPlugins = async (
  new_plugins: PluginOptions[],
  force_transform = false,
  merge_configs = false,
  config_path = "vite.config.ts",
  wasm_path = fileURLToPath(new URL("./wasm/swc_plugin_solid_cli.wasm", import.meta.url)),
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

export type IntegrationsValue = { pluginOptions: PluginOptions; postInstall?: () => Promise<void> };

export type Integrations = Record<Supported, IntegrationsValue>;

export const integrations = {
  "unocss": {
    pluginOptions: {
      importName: "UnoCss",
      importSource: "unocss/vite",
      isDefault: true,
      options: {},
    },
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
  },
};
