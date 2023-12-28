import { homedir as oshomedir, tmpdir as ostmpdir } from "os";

export const homedir = () => {
	return process.env.XDG_CONFIG_HOME ?? oshomedir();
};

export const tmpdir = () => {
	return process.env.XDG_CACHE_HOME ?? ostmpdir();
};
