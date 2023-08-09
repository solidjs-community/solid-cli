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
	test("A derived memo accessed within a batch should resolve to the correct value", () => {
		const [get, set] = createSignal(0);
		const memo = createMemo(() => get() * 2);
		let updates = 0;
		// First update on initial run
		const derived = createMemo(() => {
			updates++;
			return memo()! * 2;
		});
		batch(() => {
			set(1);
			set(2);
			// 2nd Update on access
			expect(derived()).toBe(8);
			set(3);
			// 3rd update on access
			expect(derived()).toBe(12);
		});
		expect(updates).toBe(3);
	});
	test.skip("Diamond problem with memos accessed in a batch", () => {
		const [get, set] = createSignal(0);
		let updates = 0;
		const A = createMemo(() => {
			updates++;
			get();
		});
		const B = createMemo(() => A()! * 2);
		const C = createMemo(() => A()! * 3);
		const D = createMemo(() => B()! + C()!);
		batch(() => {
			set(2);
		});
		// Actually currently get 3 here
		expect(updates).toBe(2);
	});
});
