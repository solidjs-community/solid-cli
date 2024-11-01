// Taken almost verbatim from https://github.com/solidjs/solid-start/blob/f351f42ba8566cbfa72b483dd63d4debcb386230/packages/create-solid/cli/index.js#L62C1-L80C2
export const detectPackageManager = (): PackageManager => {
	// This environment variable is set by npm and yarn but pnpm seems less consistent
	const userAgent = process.env.npm_config_user_agent || "";

	switch (true) {
		case userAgent.startsWith("yarn"):
			return {
				name: "yarn",
				runner: "npx",
				installCommand: "add",
				runScriptCommand(s) {
					return `run ${s}`;
				},
			};
		case userAgent.startsWith("pnpm"):
			return {
				name: "pnpm",
				runner: "pnpx",
				installCommand: "add",
				runScriptCommand(s) {
					return s;
				},
			};
		case userAgent.startsWith("bun"):
			return {
				name: "bun",
				runner: "bunx",
				installCommand: "add",
				runScriptCommand(s) {
					return s;
				},
			};
		case userAgent.startsWith("deno"):
			return {
				name: "deno",
				runner: "deno run",
				installCommand: "add",
				runScriptCommand(s) {
					return `task ${s}`;
				},
			};
		default:
			return {
				name: "npm",
				runner: "npx",
				installCommand: "install",
				runScriptCommand(s) {
					return `run ${s}`;
				},
			};
	}
};

export const getInstallCommand = (packageManager: PackageManager): string => {
	return packageManager.installCommand;
};

export const getRunnerCommand = (packageManager: PackageManager) => {
	return packageManager.runner;
};

export type PackageManager = {
	name: string;
	runner: string;
	installCommand: string;
	runScriptCommand: (script: string) => string;
};
