import { readdir, copyFile, unlink } from "fs/promises";
const main = async () => {
	const files = await readdir("./dist");
	const name = files.find((f) => f.startsWith("swc_plugin_solid_cli"));
	if (!name) throw new Error("No file found");
	await copyFile(`./dist/${name}`, `./dist/transform/${name}`);
	await unlink(`./dist/${name}`);
};
main().catch(console.error);
