type Getter<T> = () => T;
type Setter<T> = (val: T | ((val: T | null) => T)) => void;
type Signal<T> = [Getter<T>, Setter<T>];
let OBSERVER: Computation<any> | null = null;
class Computation<T> {
  fn: () => T;
  value: T | null = null;
  state: number = 0;
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
    this.track();
    return this.value;
  };
  set = (newVal: T) => {
    this.value = newVal;
    this.notifyObservers();
  };
  update() {
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
export function untrack<T>(fn: () => T) {
  const prev = OBSERVER;
  OBSERVER = null;
  const res = fn();
  OBSERVER = prev;
  return res;
}
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
