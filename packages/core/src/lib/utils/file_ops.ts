import { readFile } from "fs/promises";
import { queueUpdate } from "@solid-cli/utils/updates";
export const writeFile = (path: string, data: string, checked: boolean = false) => {
	queueUpdate({ type: "file", name: path, contents: data, checked });
};
export const readFileToString = async (path: string) => {
	return (await readFile(path)).toString();
};
export const writeChecked = async (path: string, contents: string) => {
	queueUpdate({ type: "file", name: path, contents, checked: true });
};
export const insertAtBeginning = async (path: string, text: string) => {
	const contents = await readFileToString(path);
	writeFile(path, text + contents);
};
export const insertAtEnd = async (path: string, text: string) => {
	const contents = await readFileToString(path);
	writeFile(path, contents + text);
};
export const replaceString = async (path: string, search: string | RegExp, replace: string) => {
	let contents = await readFileToString(path);
	contents = contents.replace(search, replace);
	writeFile(path, contents);
};
export const insertBefore = async (path: string, search: string | RegExp, text: string) => {
	await replaceString(path, search, text + search);
};
export const insertAfter = async (path: string, search: string | RegExp, text: string) => {
	await replaceString(path, search, search + text);
};
