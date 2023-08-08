import { homedir as oshomedir, tmpdir as ostmpdir } from "os";

export const homedir = () => {
	return oshomedir();
};

export const tmpdir = () => {
	return ostmpdir();
};
