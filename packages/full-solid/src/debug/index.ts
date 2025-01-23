/// This subcommand prints useful debug info to stdout
import { readFile } from "fs/promises";
import os from "os";
import { defineCommand } from "citty";
import { detectRuntime } from "./runtime-detector";
import * as p from "@clack/prompts";
type DebugInfo = {
	runtime: { name: string; version: string };
	os: { platform: string; release: string };
	packages: Record<string, string>;
};
const getPackageJSON = async () => {
	const f = await readFile("package.json");
	const parsed = JSON.parse(f.toString());
	return parsed;
};
const prettyPrintRecord = (record: Record<string, string>) => {
	let str = "";
	for (const key in record) {
		const value = record[key];
		str += `  ${key}: ${value}\n`;
	}
	return str;
};

export const prettyPrint = (info: DebugInfo) => {
	return `System:
  OS: ${info.os.platform} ${info.os.release}
Runtime:
  ${info.runtime.name}: ${info.runtime.version}
${
	Object.keys(info.packages).length !== 0
		? `Dependencies:
${prettyPrintRecord(info.packages)}`
		: ""
}`;
};
export const fetchDebugInfo = async (): Promise<DebugInfo> => {
	const parsed = await getPackageJSON();
	const packages: Record<string, string> = parsed.dependencies ?? {};
	const runtime = detectRuntime();
	return {
		runtime,
		os: {
			platform: os.platform(),
			release: os.release(),
		},
		packages,
	};
};

export const debuginfo = defineCommand({
	meta: { description: "Print important debug info" },
	async run(_ctx) {
		const info = await fetchDebugInfo();
		p.log.info(prettyPrint(info));
	},
});
