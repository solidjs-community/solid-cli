import { describe, test, expect } from "vitest";
import { createEffect, createMemo, createSignal } from "../src";
describe("createSignal", () => {
	test("A signal should hold a value that can be updated", () => {
		const [value, setValue] = createSignal(0);
		expect(value()).toBe(0);
		setValue(1);
		expect(value()).toBe(1);
	});
});
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
});
describe("createMemo", () => {
	test("A memo is executed once on creation", () => {
		let updates = 0;
		createMemo(() => {
			updates++;
		});
		expect(updates).toBe(1);
	});
	test("A memo updates when its dependencies change", () => {
		const [value, setValue] = createSignal(0);
		let updates = 0;
		createMemo(() => {
			value();
			updates++;
		});
		expect(updates).toBe(1);
		setValue(1);
		expect(updates).toBe(2);
	});
	test("Memos don't overexecute if a dependency doesn't change", () => {
		const [value, setValue] = createSignal(0);
		const memo1 = createMemo(() => {
			value();
			return 1;
		});
		let updates = 0;
		const memo2 = createMemo(() => {
			updates++;
			return memo1();
		});
		expect(memo2()).toBe(1);
		setValue(0);
		expect(updates).toBe(1);
	});
	test("Memos don't overexecute in a diamond (The diamond problem)", () => {
		const [A, setA] = createSignal(0);
		const B = createMemo(() => {
			console.log("B updating");
			return A() * 2;
		});
		const C = createMemo(() => {
			console.log("C updating");
			return A() + 2;
		});
		let updates = 0;
		const D = createMemo(() => {
			updates++;
			return B()! + C()!;
		});
		expect(D()).toBe(2);
		setA(1);
		expect(D()).toBe(5);
		expect(updates).toBe(2);
	});
});
