import { existsSync, lstatSync, readdirSync } from "fs";
import { isSolidStart } from "./solid_start";
import { join, resolve } from "path";
import { $ } from "execa";

export const getProjectRoot = async () => {
	const { stdout } = await $`npm root`;

	return stdout.slice(0, stdout.lastIndexOf("/"));
};

export const getRootFile = async () => {
	if (await isSolidStart()) {
		return "src/root.tsx";
	}
	return "src/index.tsx";
};

export const fileExists = (path: string) => {
	return existsSync(path);
};

export function validateFilePath(path: string, lookingFor: string): string | undefined;
export function validateFilePath(path: string, lookingFor: string[]): string | undefined;
export function validateFilePath(path: string, lookingFor: string | string[]): string | undefined {
	path = resolve(path);
	const isDir = lstatSync(path).isDirectory();
	if (isDir) {
		const files = readdirSync(path, { withFileTypes: true });

		const config = files.find((file) => {
			if (Array.isArray(lookingFor)) {
				return lookingFor.some((s) => file.name.startsWith(s));
			}

			return file.name.startsWith(lookingFor);
		});
		return config ? join(path, config.name) : undefined;
	}

	const pathIsValid = Array.isArray(lookingFor)
		? lookingFor.some((s) => path.startsWith(s))
		: path.startsWith(lookingFor);

	const exists = fileExists(path) && pathIsValid;

	return exists ? path : undefined;
}

export async function findFiles(
	startPath: string,
	lookingFor: string | string[],
	opts: { depth?: number; ignoreDirs: string[] },
): Promise<string[]> {
	let { depth = Infinity, ignoreDirs = ["node_modules", "."] } = opts;

	startPath = resolve(startPath);

	const isDir = lstatSync(startPath).isDirectory();

	if (!isDir) {
		startPath = resolve(startPath.slice(0, startPath.lastIndexOf("/")));
	}

	let filePaths: string[] = [];

	const files = readdirSync(startPath, { withFileTypes: true });

	for (const file of files) {
		if (file.isDirectory() && !ignoreDirs.some((s) => file.name.includes(s))) {
			if (Number.isFinite(depth) && depth-- <= 0) continue;
			filePaths = filePaths.concat(await findFiles(resolve(startPath, file.name), lookingFor, opts));
			continue;
		}

		if (file.isFile()) {
			const fileMatch = Array.isArray(lookingFor)
				? lookingFor.some((s) => file.name.startsWith(s))
				: file.name.startsWith(lookingFor);

			if (fileMatch) {
				filePaths.push(resolve(startPath, file.name));
			}
		}
	}

	return filePaths;
}
