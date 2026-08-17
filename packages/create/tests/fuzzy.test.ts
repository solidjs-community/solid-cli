import { describe, expect, it } from "vitest";
import { fuzzyScore, rankedOptionsFn } from "../src/utils/fuzzy";

// Representative template names drawn from src/utils/constants.ts
const TEMPLATES = [
	"basic",
	"bare",
	"with-auth",
	"with-authjs",
	"with-drizzle",
	"with-mdx",
	"with-prisma",
	"with-solid-styled",
	"with-solidbase",
	"with-solid-router",
	"with-strict-csp",
	"with-tailwindcss",
	"with-tanstack-router-config-based",
	"with-tanstack-router-file-based",
	"with-tanstack-start",
	"with-trpc",
	"with-unocss",
	"with-vitest",
] as const;

const matches = (query: string) => TEMPLATES.filter((template) => fuzzyScore(query, template) > 0);

describe("fuzzyScore — against real template names", () => {
	it("still matches plain substrings: 'auth' -> with-auth, with-authjs", () => {
		expect(matches("auth")).toEqual(["with-auth", "with-authjs"]);
	});

	it("matches non-contiguous chars in order: 'wath' -> with-auth(+)", () => {
		// w…a…t…h — the headline fuzzy case
		expect(matches("wath")).toEqual(expect.arrayContaining(["with-auth", "with-authjs"]));
		expect(matches("wath")).not.toContain("bare");
		expect(matches("wath")).not.toContain("with-trpc");
	});

	it("'drz' -> with-drizzle only (d…r…z)", () => {
		expect(matches("drz")).toEqual(["with-drizzle"]);
	});

	it("'tail' matches tailwindcss (and, as a fuzzy side-effect, the file-based router)", () => {
		// 'tail' = t…a…i…l: the same sequence also appears in-order inside
		// "...tanstack-router-fi[l]e-based" (t/a from tanstack, i/l from file),
		// which is the inherent permissiveness of fuzzy matching.
		expect(matches("tail")).toEqual(["with-tailwindcss", "with-tanstack-router-file-based"]);
	});

	it("'csp' -> with-strict-csp only", () => {
		expect(matches("csp")).toEqual(["with-strict-csp"]);
	});

	it("'router' -> all router templates", () => {
		expect(matches("router")).toEqual([
			"with-solid-router",
			"with-tanstack-router-config-based",
			"with-tanstack-router-file-based",
		]);
	});

	it("'tanstack' -> all tanstack templates", () => {
		expect(matches("tanstack")).toEqual([
			"with-tanstack-router-config-based",
			"with-tanstack-router-file-based",
			"with-tanstack-start",
		]);
	});

	it("returns empty for impossible queries", () => {
		expect(matches("xyz")).toEqual([]);
		expect(matches("q")).toEqual([]);
		expect(matches("zzz")).toEqual([]);
	});

	it("empty query matches all templates", () => {
		expect(matches("")).toEqual([...TEMPLATES]);
	});

	it("is case-insensitive: 'WATH' matches the same templates as 'wath'", () => {
		expect(matches("WATH")).toEqual(matches("wath"));
	});
});

describe("fuzzyScore — match-quality ranking", () => {
	it("contiguous match beats scattered match", () => {
		// "tail" aligns as a tight run in tailwindcss, but scatters through tanstack
		expect(fuzzyScore("tail", "with-tailwindcss")).toBeGreaterThan(
			fuzzyScore("tail", "with-tanstack-router-file-based"),
		);
	});

	it("adds one point for each contiguous pair", () => {
		expect(fuzzyScore("auth", "with-auth")).toBe(7);
		expect(fuzzyScore("wath", "with-auth")).toBe(5);
	});

	it("does not award word-boundary or prefix bonuses", () => {
		expect(fuzzyScore("tail", "detail")).toBe(fuzzyScore("tail", "with-tailwindcss"));
	});

	it("returns 0 when input cannot be matched in order", () => {
		expect(fuzzyScore("xyz", "with-auth")).toBe(0);
		expect(fuzzyScore("with-auth", "auth")).toBe(0);
	});

	it("empty input ties everything at a positive score", () => {
		expect(fuzzyScore("", "with-auth")).toBeGreaterThan(0);
		expect(fuzzyScore("", "bare")).toBeGreaterThan(0);
	});

	it("scores case-insensitively: uppercase query matches lowercase target the same", () => {
		expect(fuzzyScore("AUTH", "with-auth")).toBe(fuzzyScore("auth", "with-auth"));
	});
});

describe("rankedOptionsFn — ordering for clack autocomplete", () => {
	const opts = TEMPLATES.map((t) => ({ label: t, value: t }));
	// Simulate clack calling the options fn with the prompt's `this.userInput`.
	const ranked = (query: string) =>
		(rankedOptionsFn(opts).call({ userInput: query }) as typeof opts).map((o) => o.label);

	it("ranks an exact substring above a fuzzy scatter: 'tail'", () => {
		// tailwindcss contains "tail" verbatim; file-based only matches it fuzzily
		expect(ranked("tail")).toEqual(["with-tailwindcss", "with-tanstack-router-file-based"]);
	});

	it("keeps prefix/substring winners first: 'auth'", () => {
		expect(ranked("auth")).toEqual(["with-auth", "with-authjs"]);
	});

	it("resolves the headline fuzzy case with stable order: 'wath'", () => {
		// both match fuzzily with equal scores and starts → alphabetical order
		expect(ranked("wath")).toEqual(["with-auth", "with-authjs"]);
	});

	it("lands early-typing queries on the strongest contiguous match", () => {
		const r = ranked("ta");
		expect(r[0]).toBe("with-tailwindcss");
		expect(r.indexOf("with-tailwindcss")).toBeLessThan(r.indexOf("with-auth"));
	});

	it("breaks score ties by earliest match start", () => {
		const options = ["zz-tail", "tail-zz"].map((label) => ({ label, value: label }));
		const result = rankedOptionsFn(options).call({ userInput: "tail" });
		expect(result.map(({ label }) => label)).toEqual(["tail-zz", "zz-tail"]);
	});

	it("breaks score and start ties alphabetically", () => {
		const options = ["cat", "car"].map((label) => ({ label, value: label }));
		const result = rankedOptionsFn(options).call({ userInput: "ca" });
		expect(result.map(({ label }) => label)).toEqual(["car", "cat"]);
	});

	it("narrows to a single best match: 'drz'", () => {
		expect(ranked("drz")).toEqual(["with-drizzle"]);
	});

	it("returns nothing for impossible queries", () => {
		expect(ranked("xyz")).toEqual([]);
	});

	it("empty input preserves the original option order", () => {
		expect(ranked("")).toEqual([...TEMPLATES]);
	});
});
