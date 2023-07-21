import { Computation, Getter, Signal, runWithListener } from "../core";

export function on<T>(deps: Getter<unknown>[] | Getter<unknown>, fn: () => T) {
	return () => {
		// Track all getters on call
		Array.isArray(deps) ? deps.forEach((d) => d()) : deps();
		// Ensure that the function isn't tracked
		return untrack(fn);
	};
}
export function createSignal<T>(val: T) {
	const comp = new Computation(() => val);
	const set = (fnOrVal: T | ((val: T | null) => T) | null) => {
		if (typeof fnOrVal === "function") {
			let fn = fnOrVal as (val: T | null) => T;
			const newVal = fn(untrack(comp.get));
			comp.set(newVal);
		} else {
			comp.set(fnOrVal as T);
		}
	};
	return [comp.get, set] as Signal<T>;
}
export function createEffect<T>(fn: () => T) {
	new Computation(fn);
}
export function createMemo<T>(fn: () => T) {
	const comp = new Computation(fn);
	return comp.get;
}
export function untrack<T>(fn: () => T) {
	return runWithListener(null, fn);
}
