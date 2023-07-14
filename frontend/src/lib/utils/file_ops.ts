import { readFile, writeFile } from "fs/promises";

export const insertAtBeginning = async (filePath: string, text: string) => {
	const contents = (await readFile(filePath)).toString();
	await writeFile(filePath, text + contents);
};
