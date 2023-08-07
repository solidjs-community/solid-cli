import { join } from "path";
import { configInst } from "../config";
import defaultCommands from "../commands";

const resolveImport = async (packagePath: string) => {
  const packageJson = await import(join(packagePath, "package.json"));
  return await import(join(packagePath, packageJson.module));
};
const loadUserCommands = async () => {
  const pluginPaths = configInst.field("plugins") as string[];
  if (!pluginPaths) return null;
  const imports = await Promise.all(pluginPaths.map((p) => resolveImport(p)));
  const importedCommands = imports.map((i) => i.default);
  let commands = {} as any;
  importedCommands.forEach((c) => {
    const name = c.name;
    commands[name] = c;
  });
  return commands;
};
const loadCommands = async () => {
  const cmds = {
    ...defaultCommands,
    ...(await loadUserCommands()),
  };
  return cmds;
};
export default loadCommands;
