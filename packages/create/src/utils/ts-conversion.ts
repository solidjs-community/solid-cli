import { copyFileSync, Dirent, mkdirSync, writeFileSync } from "node:fs";
import { readFileToString, recurseFiles } from "./file-system";
import { join, resolve } from "node:path";
import { transform } from "sucrase";
import { rm } from "node:fs/promises";
import { JS_CONFIG } from "./constants";

const convertToJS = async (file: Dirent, startPath: string) => {
	const src = join(startPath, file.name);
	const dest = resolve(startPath.replace(".project", ""), file.name);
	if (file.isDirectory()) {
		mkdirSync(dest, { recursive: true });
		recurseFiles(resolve(startPath, file.name), convertToJS);
	} else if (file.isFile()) {
		if (src.endsWith(".ts") || src.endsWith(".tsx")) {
			let { code } = transform(await readFileToString(src), {
				transforms: ["typescript", "jsx"],
				jsxRuntime: "preserve",
			});

			writeFileSync(dest.replace(".ts", ".js"), code, { flag: "wx" });
		} else {
			copyFileSync(src, dest);
		}
	}
};
export const handleTSConversion = async (tempDir: string, projectName: string) => {
	await rm(resolve(tempDir, "tsconfig.json"));
	writeFileSync(resolve(projectName, "jsconfig.json"), JSON.stringify(JS_CONFIG, null, 2), { flag: "wx" });

	// Convert all ts files in temp directory into js
	recurseFiles(tempDir, convertToJS);

	// Remove temp directory
	await rm(join(process.cwd(), tempDir), {
		recursive: true,
		force: true,
	});
};
