import { describe, expect, test } from "vitest";
import { createAsync, createEffect } from "../src";

describe("createAsync", () => {
	test("An async function resolves to a value", async () => {
		const asyncFn = createAsync(async () => {
			return 123;
		});
		const res = await new Promise((res) => {
			createEffect(() => {
				const result = asyncFn();
				if (result) res(result);
			});
		});
		expect(res).toBe(123);
	});
	test("An async function has a loading state", async () => {
		const asyncFn = createAsync(async () => {
			return 123;
		});
		expect(asyncFn.loading).toBe(true);
		queueMicrotask(() => expect(asyncFn.loading).toBe(false));
	});
});
