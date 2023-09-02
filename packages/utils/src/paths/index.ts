import { PM } from "../detect-package-manager";
import { homedir as oshomedir, tmpdir as ostmpdir } from "os";

export const homedir = () => {
	return process.env.XDG_CONFIG_HOME ?? oshomedir();
};

export const tmpdir = () => {
	return process.env.XDG_CACHE_HOME ?? ostmpdir();
};
export const getRunner = (pM: PM) => {
	switch (pM) {
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
