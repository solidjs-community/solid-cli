import { Computation, Getter, Signal, batch, runWithListener } from "../core";
export { batch, getListener } from "../core";
type OnOptions = { defer: boolean };
export function on<T, G>(deps: Getter<G>, fn: (val: G) => T, options?: OnOptions): () => T | undefined;
export function on<T>(deps: Getter<unknown>[] | Getter<unknown>, fn: (val: any) => T, options?: OnOptions) {
	let shouldDefer = options?.defer ?? false;
	return () => {
		// Track all getters on call
		let args: any[] = [];
		Array.isArray(deps) ? deps.forEach((d) => args.push(d())) : args.push(deps());
		if (shouldDefer) {
			shouldDefer = false;
			return;
		}
		// Ensure that the function isn't tracked
		return untrack(() => fn(args.length === 1 ? args[0] : args));
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
export function createAsync<T>(fn: () => Promise<T>) {
	const [get, set] = createSignal<T | null>(null);
	const [loading, setLoading] = createSignal(true);
	fn().then((val) => {
		batch(() => {
			set(val);
			setLoading(false);
		});
	});
	Object.defineProperties(get, {
		loading: {
			get() {
				return loading();
			},
		},
	});
	return get as Getter<T> & { loading: boolean };
}
export function untrack<T>(fn: () => T) {
	return runWithListener(null, fn);
}
