import { readFile } from "fs/promises";

export const isSolidStart = async () => {
	const packageJsonStr = (await readFile("./package.json")).toString();
	const packageJson = JSON.parse(packageJsonStr);
	const deps = Object.keys(packageJson["dependencies"] ?? {});
	const devDeps = Object.keys(packageJson["devDependencies"] ?? {});
	const allDeps = deps.concat(devDeps);
	for (let i = 0; i < allDeps.length; i++) {
		const dep = allDeps[i];
		if (dep === "@solidjs/start") return true;
	}
	return false;
};

export * from "./add_api";
export * from "./add_data";
export * from "./add_route";
