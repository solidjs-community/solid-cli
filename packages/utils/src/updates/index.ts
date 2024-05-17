import { open, writeFile } from "fs/promises";
import { $ } from "execa";
import { detectPackageManager, getInstallCommand } from "../package-manager";
declare global {
	var UPDATESQUEUE: Update[] | undefined;
}
// Batch all updates here, so we can confirm with the user then flush
export const UPDATESQUEUE: Update[] = globalThis.UPDATESQUEUE ?? [];
globalThis.UPDATESQUEUE = UPDATESQUEUE;
type PackageUpdate = { type: "package"; name: string; dev: boolean };
type CommandUpdate = { type: "command"; name: string };
type FileUpdate = { type: "file"; name: string; contents: string; checked: boolean };
// Don't bother explicitly handling plugin updates, since they're just a file update
export type Update = PackageUpdate | CommandUpdate | FileUpdate;
type UpdateSummary = {
	packageUpdates: string[];
	commandUpdates: string[];
	fileUpdates: string[];
};

export const clearQueue = () => {
	UPDATESQUEUE.length = 0;
};
export const summarizeUpdates = (): UpdateSummary => {
	const fileUpdates = UPDATESQUEUE.filter((u) => u.type === "file").map((s) => s.name);
	const packageUpdates = UPDATESQUEUE.filter((u) => u.type === "package").map((s) => s.name);
	const commandUpdates = UPDATESQUEUE.filter((u) => u.type === "command").map((s) => s.name);
	return { packageUpdates, commandUpdates, fileUpdates };
};
export const queueUpdate = (update: Update) => {
	UPDATESQUEUE.push(update);
};
export const unqueueUpdate = (name: string, type: Update["type"]) => {
	const index = UPDATESQUEUE.findIndex((u) => u.name === name && u.type === type);
	if (index === -1) return;
	UPDATESQUEUE.splice(index, 1);
};
export const readQueued = (name: string) => {
	return UPDATESQUEUE.find((u) => u.name === name);
};
export const readQueuedFile = (name: string) => {
	const queued = readQueued(name);
	if (!queued || queued.type !== "file") return null;
	return queued;
};
export const flushFileUpdates = async () => {
	const fileUpdates = UPDATESQUEUE.filter((u) => u.type === "file") as FileUpdate[];

	for (const update of fileUpdates) {
		if (!update.checked) {
			await writeFile(update.name, update.contents);
			continue;
		}
		const handle = await open(update.name, "wx");
		try {
			await handle.writeFile(update.contents);
		} finally {
			await handle.close();
		}
	}
};
export const flushPackageUpdates = async () => {
	const packageUpdates = UPDATESQUEUE.filter((u) => u.type === "package") as PackageUpdate[];
	const pM = detectPackageManager();
	const instlCmd = getInstallCommand(pM);
	for (const update of packageUpdates) {
		await $`${pM.name} ${instlCmd}${update.dev ? " -D " : " "}${update.name}`;
	}
};
export const flushCommandUpdates = async () => {
	const commandUpdates = UPDATESQUEUE.filter((u) => u.type === "command") as CommandUpdate[];
	for (const update of commandUpdates) {
		await $`${update.name}`;
	}
};
/**
 * Flushes every operation in the queue
 */
export const flushQueue = async () => {
	await flushFileUpdates();
	await flushPackageUpdates();
	await flushCommandUpdates();
	clearQueue();
};
