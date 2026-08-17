import { runCommand } from "citty";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { autocomplete } = vi.hoisted(() => ({ autocomplete: vi.fn() }));

vi.mock("@clack/prompts", async (importOriginal) => ({
	...(await importOriginal<typeof import("@clack/prompts")>()),
	autocomplete,
}));

import { createSolid } from "../src";

// Unroutable address: fetchTemplatesManifest fails fast and falls back to the
// baked-in template lists, same trick used in manifest.test.ts.
beforeEach(() => {
	process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL = "http://127.0.0.1:1/templates.json";
});
afterEach(() => {
	delete process.env.SOLID_CLI_TEMPLATES_MANIFEST_URL;
});

it("uses an autocomplete prompt when selecting a template", async () => {
	autocomplete.mockResolvedValueOnce(undefined);

	await runCommand(createSolid("test"), { rawArgs: ["test-app", "--vanilla", "--ts"] });

	const { options, filter, validate, placeholder } = autocomplete.mock.calls[0][0];
	expect(autocomplete).toHaveBeenCalledWith({
		message: "Which template would you like to use?",
		placeholder: "Type to search...",
		filter: expect.any(Function),
		validate: expect.any(Function),
		options,
	});
	expect(options.call({ userInput: "tail" })[0].value).toBe("with-tailwindcss");

	// clack's autocomplete always focuses options[0] on an empty search box (it ignores a
	// scalar `initialValue`), so the manifest's default-flagged template must be first.
	expect(options.call({ userInput: "" })[0].value).toBe("basic");

	// The filter must use the same fuzzy scoring as the ranking fn: a substring filter
	// would reject "wath" against "with-auth" and re-filter out the ranked results.
	expect(filter("wath", { label: "with-auth", value: "with-auth" })).toBe(true);

	// clack copies its `placeholder` into the search box on Tab whenever `filter` matches
	// it against any option in the current (unfiltered) list; none may match, or Tab
	// would fill the search with unmatched text and trigger the "no match" error.
	expect(options.call({ userInput: "" }).some((o: { label: string; value: string }) => filter(placeholder, o))).toBe(
		false,
	);

	// An empty autocomplete search resolves to `value: undefined`; validate must
	// reject that with an error message instead of letting the CLI exit silently.
	expect(validate(undefined)).toEqual(expect.any(String));
	expect(validate("with-auth")).toBeUndefined();
});
