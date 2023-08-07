import { join } from "path";
import { configInst } from "../config";
import defaultCommands from "../commands";
const loadUserCommands = async () => {
  const pluginPaths = configInst.field("plugins") as string[];
  if (!pluginPaths) return null;
  const paths = pluginPaths.map((p) => join(p, "dist", "index.js"));
  const imported = await Promise.all(paths.map(async (p) => import(p)));
  console.log(imported);
  return {};
};
const loadCommands = async () => {
  return {
    ...defaultCommands,
    ...(await loadUserCommands()),
  };
};
export default loadCommands;
