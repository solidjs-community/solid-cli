import { log } from "@clack/prompts";
export const cancelable = async <T = unknown>(
	prompt: Promise<T | symbol>,
	cancelMessage: string = "Canceled",
): Promise<T> => {
	const value = await prompt;

	if (typeof value === "symbol") {
		log.warn(cancelMessage);
		process.exit(0);
	}

	return value;
};
