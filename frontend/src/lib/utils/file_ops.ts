import { readFile, writeFile } from "fs/promises";
export const readFileToString = async (path: string) => {
	return (await readFile(path)).toString();
};
export const insertAtBeginning = async (filePath: string, text: string) => {
	const contents = await readFileToString(filePath);
	await writeFile(filePath, text + contents);
};
export const insertAtEnd = async (filePath: string, text: string) => {
	const contents = await readFileToString(filePath);
	await writeFile(filePath, contents + text);
};
export const replaceString = async (
	filePath: string,
	search: string | RegExp,
	replace: string
) => {
	let contents = await readFileToString(filePath);
	contents = contents.replace(search, replace);
	await writeFile(filePath, contents);
};
export const insertBefore = async (
	filePath: string,
	search: string | RegExp,
	text: string
) => {
	await replaceString(filePath, search, text + search);
};
export const insertAfter = async (
	filePath: string,
	search: string | RegExp,
	text: string
) => {
	await replaceString(filePath, search, search + text);
};
