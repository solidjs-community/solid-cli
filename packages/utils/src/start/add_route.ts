import { mkdir } from "fs/promises";
import { writeChecked } from "../fs";

const default_file = `export default function Route() {
	return <></>;
}
`;

export const createRoute = async (path: string, name?: string) => {
	const path_parts = path.split("/");

	path_parts.unshift("src", "routes");

	await mkdir(path_parts.join("/"), { recursive: true });

	path_parts.push(name ? `(${name}).tsx` : "index.tsx");

	await writeChecked(path_parts.join("/"), default_file);
};
