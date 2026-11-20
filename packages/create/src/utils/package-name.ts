import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

/**
 * Sanitizes a project directory name into a valid npm package name.
 * Same rules as Vite's `create-vite`: lowercase, spaces become dashes,
 * invalid characters become dashes, no leading `.`/`_`.
 */
export const toValidPackageName = (projectName: string) =>
	projectName
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/^[._]/, "")
		.replace(/[^a-z\d\-~]+/g, "-");

/**
 * Derives the package name from the scaffold destination. `destination` is
 * repo-relative (begit resolves it against `process.cwd()`), so resolving
 * first also handles `"."` (names the package after the current directory)
 * and nested paths (`"foo/bar"` -> `"bar"`).
 */
export const projectNameFromDestination = (destination: string) => toValidPackageName(basename(resolve(destination)));

/**
 * Rewrites the `name` field of the scaffolded project's `package.json` so it
 * matches the project directory instead of the template's name (e.g.
 * `"vite-template-solid"`). Indentation and the trailing newline are detected
 * from the file so the rewrite doesn't churn the template's formatting.
 * No-op when the project has no package.json.
 */
export const updatePackageJsonName = async (destination: string) => {
	const pkgPath = resolve(destination, "package.json");
	if (!existsSync(pkgPath)) return;
	const raw = (await readFile(pkgPath)).toString();
	const pkg = JSON.parse(raw);
	const name = projectNameFromDestination(destination);
	if (pkg.name === name) return;
	pkg.name = name;
	const indent = raw.match(/^([ \t]+)"/m)?.[1] ?? "  ";
	await writeFile(pkgPath, JSON.stringify(pkg, null, indent) + (raw.endsWith("\n") ? "\n" : ""));
};
