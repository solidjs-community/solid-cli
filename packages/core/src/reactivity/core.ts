let OBSERVER: (() => any) | null = null;

export const createSignal = <T>(val: T) => {
  const listeners: Set<() => any> = new Set();
  const get = () => {
    if (OBSERVER) listeners.add(OBSERVER);
    return val;
  };
  const set = (newVal: T) => {
    val = newVal;
    listeners.forEach((listener) => listener());
  };
  return [get, set] as [() => T, (val: T) => void];
};

export const createEffect = <T>(fn: () => T) => {
  const prev = OBSERVER;
  OBSERVER = fn;
  fn();
  OBSERVER = prev;
};
