import { writeFile, mkdir } from "fs/promises";
import { writeChecked } from "../utils/file_ops";

export const createData = async (path: string, name?: string) => {
  const path_parts = path.split("/");
  path_parts.unshift("src", "routes");
  await mkdir(path_parts.join("/"), { recursive: true });
  path_parts.push(`${name}.data.ts` ?? "index.data.ts");
  await writeChecked(path_parts.join("/"), "");
};
