import { test, expect } from "vitest";
import { describe } from "vitest";
import { batch, createAsync, createEffect, createMemo, createSignal } from "../src";

describe("batch", () => {
	test("Multiple updates should only trigger an effect once", () => {
		const [get, set] = createSignal(0);
		let updates = 0;
		createEffect(() => {
			get();
			updates++;
		});
		batch(() => {
			set(1);
			set(2);
		});
		expect(updates).toBe(2);
		expect(get()).toBe(2);
	});
	test("A memo called within a batch should get its value updated", () => {
		const [get, set] = createSignal(0);
		const memo = createMemo(() => get() * 2);
		batch(() => {
			set(1);
			expect(memo()).toBe(2);
		});
	});
	test("An effect depending on both loading and data should only run once when the async resolves", async () => {
		const data = createAsync(async () => {
			return 123;
		});
		let updates = 0;
		await new Promise((res) =>
			createEffect(() => {
				// We track both the data itself and the loading signal
				const d = data();
				const loading = data.loading;
				updates++;
				if (d === 123 && loading === false) res(d);
			}),
		);
		expect(updates).toBe(2);
	});
});
