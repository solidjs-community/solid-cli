import { readFile, writeFile } from "fs/promises";
// import { queueUpdate, readQueuedFile, unqueueUpdate } from "../updates";
// export const writeFile = (path: string, data: string, checked: boolean = false) => {
// 	// First, unqueue all previous updates to this file
// 	unqueueUpdate(path, "file");
// 	queueUpdate({ type: "file", name: path, contents: data, checked });
// };
// export const readFile = async (path: string) => {
// 	const queued = readQueuedFile(path);
// 	if (queued) return queued.contents;
// 	return await readFile1(path);
// };
export const readFileToString = async (path: string) => {
	return (await readFile(path)).toString();
};
// export const writeChecked = async (path: string, contents: string) => {
// 	unqueueUpdate(path, "file");
// 	queueUpdate({ type: "file", name: path, contents, checked: true });
// };
export const writeChecked = async (_path: string, _contents: string) => {
	throw new Error("Unimplemented");
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
