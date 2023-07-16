import { isSolidStart } from "./solid_start";

export const getProjectRoot = async () => {
  if (await isSolidStart()) {
    return "src/root.tsx";
  }
  return "src/index.tsx";
};
