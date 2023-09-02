// Taken almost verbatim from https://github.com/solidjs/solid-start/blob/f351f42ba8566cbfa72b483dd63d4debcb386230/packages/create-solid/cli/index.js#L62C1-L80C2
export const getUserPkgManager = (): PM => {
	// This environment variable is set by npm and yarn but pnpm seems less consistent
	const userAgent = process.env.npm_config_user_agent;

	if (userAgent) {
		if (userAgent.startsWith("yarn")) {
			return "yarn";
		} else if (userAgent.startsWith("pnpm")) {
			return "pnpm";
		} else if (userAgent.startsWith("bun")) {
			return "bun";
		} else {
			return "npm";
		}
	} else {
		// If no user agent is set, assume npm
		return "npm";
	}
};

export type PM = "npm" | "yarn" | "pnpm" | "bun";
