import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Add a package to the scaffolded project's `devDependencies`, keeping the
 * block alphabetized like the templates ship it. Indentation and the
 * trailing newline are detected from the file so the rewrite doesn't churn
 * the template's formatting. No-op when the project has no package.json.
 */
export const addDevDependency = async (projectDir: string, name: string, version: string) => {
	const pkgPath = join(projectDir, "package.json");
	if (!existsSync(pkgPath)) return;
	const raw = (await readFile(pkgPath)).toString();
	const pkg = JSON.parse(raw);
	pkg.devDependencies = Object.fromEntries(
		Object.entries({ ...pkg.devDependencies, [name]: version }).sort(([a], [b]) => a.localeCompare(b)),
	);
	const indent = raw.match(/^([ \t]+)"/m)?.[1] ?? "  ";
	await writeFile(pkgPath, JSON.stringify(pkg, null, indent) + (raw.endsWith("\n") ? "\n" : ""));
};
