export type Getter<T> = () => T;
export type Setter<T> = (val: T | ((val: T | null) => T)) => void;
export type Signal<T> = [Getter<T>, Setter<T>];
let OBSERVER: Computation<any> | null = null;
let BATCHING = false;
const UPDATEQUEUE: Computation<any>[] = [];
export class Computation<T> {
	fn: () => T;
	value: T | null = null;
	state: number = 0;
	isQueued: boolean = false;
	sources: Set<Computation<any>> = new Set();
	observers: Set<Computation<any>> = new Set();
	constructor(fn: () => T) {
		this.fn = fn;
		this.update();
	}
	track() {
		if (!OBSERVER) return;
		this.observers.add(OBSERVER);
		OBSERVER.sources.add(this);
	}
	get = () => {
		// We need to make sure memos update if they're accessed during a `batch`
		if (this.isQueued) {
			const prev = BATCHING;
			BATCHING = false;
			this.update();
			BATCHING = prev;
		}
		this.track();
		return this.value;
	};
	set = (newVal: T) => {
		if (newVal === this.value) return;
		this.value = newVal;
		this.notifyObservers();
	};
	removeParentObservers() {
		if (!this.sources) return;
		this.sources.forEach((s) => s.observers.delete(this));
		this.sources.clear();
	}
	update() {
		if (BATCHING) {
			if(this.isQueued) return;
			UPDATEQUEUE.push(this);
			this.isQueued = true;
			return;
		}
		this.removeParentObservers();
		const prev = OBSERVER;
		OBSERVER = this;
		const newVal = this.fn();
		OBSERVER = prev;
		if (newVal === this.value) return;
		this.value = newVal;
	}
	increment() {
		this.state++;
		// Only increment children if the state has increased to 1, as we don't want to repeatedly re-increment if this node has multiple parents that need updating
		if (this.state === 1) {
			this.observers.forEach((o) => o.increment());
		}
	}
	decrement() {
		this.state--;
		if (this.state === 0) {
			this.update();
			this.observers.forEach((o) => o.decrement());
		}
	}
	notifyObservers() {
		this.observers.forEach((o) => o.increment());
		this.observers.forEach((o) => o.decrement());
	}
}
function stabilize() {
	UPDATEQUEUE.forEach((u) => u.update());
	UPDATEQUEUE.length = 0
}
export function batch<T>(fn: () => T) {
	BATCHING = true;
	const res = fn();
	BATCHING = false;
	stabilize();
	return res;
}
export function getListener() {
	return OBSERVER;
}
export function runWithListener<T>(listener: Computation<any> | null, fn: () => T) {
	const prev = OBSERVER;
	OBSERVER = listener;
	const res = fn();
	OBSERVER = prev;
	return res;
}
