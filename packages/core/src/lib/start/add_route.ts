import { writeFile, mkdir } from "fs/promises";
import { writeChecked } from "../utils/file_ops";
const default_file = `export default function Route() {
	return <></>;
}
`;
export const createRoute = async (path: string, name?: string) => {
  const path_parts = path.split("/");
  path_parts.unshift("src", "routes");
  await mkdir(path_parts.join("/"), { recursive: true });
  path_parts.push(`${name}.tsx` ?? "Index.tsx");
  await writeChecked(path_parts.join("/"), default_file);
};
