import { Dirent, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const recurseFiles = (startPath: string, cb: (file: Dirent, startPath: string) => void) => {
	startPath = resolve(startPath);

	const files = readdirSync(startPath, { withFileTypes: true });

	for (const file of files) {
		cb(file, startPath);
	}
};

export const readFileToString = async (path: string) => {
	return (await readFile(path)).toString();
};
