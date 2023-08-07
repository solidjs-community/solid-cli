import { spinner } from "@clack/prompts";
type SpinnerItem<T> = {
	startText: string;
	finishText: string;
	fn: () => Promise<T>;
};
export async function spinnerify<T>(spinners: SpinnerItem<T>): Promise<T>;
export async function spinnerify(spinners: SpinnerItem<any>[]): Promise<any[]>;
export async function spinnerify<T>(spinners: SpinnerItem<any>[] | SpinnerItem<T>) {
	if (!Array.isArray(spinners)) spinners = [spinners];
	let results: any[] = [];
	const s = spinner();
	for (const { startText, finishText, fn } of spinners) {
		s.start(startText);
		results.push(await fn());
		s.stop(finishText);
	}
	return results.length === 1 ? results[0] : results;
}
