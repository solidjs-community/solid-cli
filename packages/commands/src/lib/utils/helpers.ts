import { existsSync, lstatSync, readdirSync } from "fs";
import { isSolidStart } from "@solid-cli/utils";
import { join, resolve } from "path";
import { $ } from "execa";
import { cancelable } from "@solid-cli/ui";
import * as p from "@clack/prompts";
import color from "picocolors";

export const getProjectRoot = async () => {
	const { stdout } = await $`npm root`;

	return stdout.slice(0, stdout.lastIndexOf("/"));
};

export const getRootFile = async () => {
	if (await isSolidStart()) {
		return "src/app.tsx";
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
	opts: { depth?: number; ignoreDirs?: string[]; startsWith?: boolean },
): Promise<string[]> {
	let { depth = Infinity, ignoreDirs = ["node_modules", "."], startsWith = true } = opts;

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
				? lookingFor.some((s) => (startsWith ? file.name.startsWith(s) : file.name.endsWith(s)))
				: startsWith
					? file.name.startsWith(lookingFor)
					: file.name.endsWith(lookingFor);

			if (fileMatch) {
				filePaths.push(resolve(startPath, file.name));
			}
		}
	}

	return filePaths;
}

export const getAppConfig = async () => {
	let configFile = "app.config.ts";

	const existsHere = fileExists(configFile);

	if (!existsHere) {
		const root = await getProjectRoot();
		const existsInRoot = validateFilePath(root, "app.config");
		if (existsInRoot) {
			const correctConfig = await cancelable(
				p.confirm({
					message: `Could not find app config in current directory, but found app config in \`${root}\`. Is this the correct vite config?`,
				}),
			);
			if (correctConfig) return existsInRoot;
		}

		p.log.error(color.red(`Can't find app.config file`));
		await cancelable(
			p.text({
				message: "Type path to app config: ",
				validate(value) {
					const path = validateFilePath(value, "app.config");
					if (!path) return `App config not found. Please try again`;
					else {
						configFile = path;
					}
				},
			}),
		);
	}

	return configFile;
};
