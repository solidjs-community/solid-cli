import { describe, test, expect } from "vitest";
import { createSignal } from "../src";
describe("createSignal", () => {
	test("A signal should hold a value that can be updated", () => {
		const [value, setValue] = createSignal(0);
		expect(value()).toBe(0);
		setValue(1);
		expect(value()).toBe(1);
	});
});
