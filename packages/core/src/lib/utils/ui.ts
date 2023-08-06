import { spinner } from "@clack/prompts";
export const spinnerify = async <T>(startText: string, finishText: string, fn: () => Promise<T>) => {
  const s = spinner();
  s.start(startText);
  const res = await fn();
  s.stop(finishText);
  return res;
};
