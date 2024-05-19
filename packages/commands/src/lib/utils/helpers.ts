import { existsSync, lstatSync, readdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
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
  let isDir: boolean;
  try {
    console.log(path);
    isDir = lstatSync(path).isDirectory();
  } catch (e) {
    return undefined;
  }
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
  let isDir: boolean;
  try {
    isDir = lstatSync(startPath).isDirectory();
  } catch (e) {
    return [];
  }
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

export const getConfigFile = async (file: "app" | "vite" = "app") => {
	let configFile = `${file}.config.ts`;

	const existsHere = fileExists(configFile);

	if (!existsHere) {
		const root = await getProjectRoot();
		const existsInRoot = validateFilePath(root, `${file}.config`);
		if (existsInRoot) {
			const correctConfig = await cancelable(
				p.confirm({
					message: `Could not find ${file} config in current directory, but found ${file} config in \`${root}\`. Is this the correct ${file} config?`,
				}),
			);
			if (correctConfig) return existsInRoot;
		}

		p.log.error(color.red(`Can't find ${file}.config file`));
		await cancelable(
			p.text({
				message: `Type path to ${file} config: `,
				validate(value) {
					const path = validateFilePath(value, `${file}.config`);
					if (!path) return `${file} config not found. Please try again`;
					else {
						configFile = path;
					}
				},
			}),
		);
	}

	return configFile;
};

export async function manipulateJsonFile(name: string, manipulate: (obj: Record<string, any>) => Record<string, any>) {
  try {
    const jsonString = await readFile(name, "utf8");
    const jsonObj = JSON.parse(jsonString);
    await writeFile(
      name,
      JSON.stringify(manipulate(jsonObj), null, /^(\t|\s+)/m.exec(jsonString)?.[0] || 2) + "\n",
      "utf8",
    );
  } catch (error) {
    p.log.error(color.red(error ? error.toString() : `unknown error when manipulating ${name}`));
  }
}
