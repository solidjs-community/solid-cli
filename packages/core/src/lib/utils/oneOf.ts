import { Type } from "cmd-ts";
import { inspect } from "util";

export function oneOf<T extends string>(literals: readonly T[], case_sensitive: boolean = false): Type<string, T> {
	const examples = literals.map((x) => inspect(x)).join(", ");
	return {
		async from(str) {
			const value = literals.find((x) => (case_sensitive ? x === str : x.toLowerCase() === str.toLowerCase()));
			if (!value) {
				throw new Error(`Invalid value '${str}'. Expected one of: ${examples}`);
			}
			return value;
		},
		description: `One of ${examples}`,
	};
}
