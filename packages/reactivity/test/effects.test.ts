import { describe, test, expect } from "vitest";
import { createEffect, createSignal } from "../src";
describe("createEffect", () => {
	test("An effect executes once when created", () => {
		let updates = 0;
		createEffect(() => {
			updates++;
		});
		expect(updates).toBe(1);
	});
	test("An effect re-executes when a dependency changes", () => {
		let updates = 0;
		const [value, setValue] = createSignal(0);
		createEffect(() => {
			value();
			updates++;
		});
		expect(updates).toBe(1);
		setValue(1);
		expect(updates).toBe(2);
	});
	test("Changes propagate correctly", () => {
		const [get, set] = createSignal(0);
		let updates = 0;
		createEffect(() => {
			get();
			updates++;
		});
		expect(updates).toBe(1);
		set(1);
		expect(updates).toBe(2);
		set(2);
		expect(updates).toBe(3);
	});
});
