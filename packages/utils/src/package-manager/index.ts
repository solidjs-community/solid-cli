// Taken almost verbatim from https://github.com/solidjs/solid-start/blob/f351f42ba8566cbfa72b483dd63d4debcb386230/packages/create-solid/cli/index.js#L62C1-L80C2
export const detectPackageManager = () => {
	// This environment variable is set by npm and yarn but pnpm seems less consistent
	const userAgent = process.env.npm_config_user_agent || "";

	switch (true) {
		case userAgent.startsWith("yarn"):
			return "yarn";
		case userAgent.startsWith("pnpm"):
			return "pnpm";
		case userAgent.startsWith("bun"):
			return "bun";
		default:
			return "npm";
	}
};

export const getInstallCommand = (packageManager: PackageManager): string => {
	switch (packageManager) {
		case "npm":
			return "install";
		case "yarn":
			return "add";
		case "pnpm":
			return "add";
		case "bun":
			return "add";
	}
};

export const getRunnerCommand = (packageManager: PackageManager) => {
	switch (packageManager) {
		case "npm":
			return "npx";
		case "yarn":
			return "npx";
		case "pnpm":
			return "pnpx";
		case "bun":
			return "bunx";
	}
};

export type PackageManager = ReturnType<typeof detectPackageManager>;
