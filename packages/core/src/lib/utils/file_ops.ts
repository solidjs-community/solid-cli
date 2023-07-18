import { exists } from "fs";
import { open } from "fs/promises";
import { readFile, writeFile } from "fs/promises";
export const readFileToString = async (path: string) => {
  return (await readFile(path)).toString();
};
export const writeChecked = async (path: string, contents: string) => {
  const handle = await open(path, "wx");
  try {
    await handle.writeFile(contents);
  } finally {
    await handle.close();
  }
};
export const insertAtBeginning = async (path: string, text: string) => {
  const contents = await readFileToString(path);
  await writeFile(path, text + contents);
};
export const insertAtEnd = async (path: string, text: string) => {
  const contents = await readFileToString(path);
  await writeFile(path, contents + text);
};
export const replaceString = async (path: string, search: string | RegExp, replace: string) => {
  let contents = await readFileToString(path);
  contents = contents.replace(search, replace);
  await writeFile(path, contents);
};
export const insertBefore = async (path: string, search: string | RegExp, text: string) => {
  await replaceString(path, search, text + search);
};
export const insertAfter = async (path: string, search: string | RegExp, text: string) => {
  await replaceString(path, search, search + text);
};
