import { mkdir } from "fs/promises";
import { writeChecked } from "../fs";

export const createApi = async (path: string, name?: string) => {
	const path_parts = path.split("/");

	path_parts.unshift("src", "routes", "api");

	await mkdir(path_parts.join("/"), { recursive: true });

	path_parts.push(name ? `${name}.ts` : "index.ts");

	await writeChecked(path_parts.join("/"), "");
};
