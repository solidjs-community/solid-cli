const CHARACTER_SCORE = 1;
const CONTIGUOUS_BONUS = 1;

type FuzzyMatch = {
	score: number;
	startIndex: number;
};

const NO_MATCH: FuzzyMatch = { score: 0, startIndex: Number.POSITIVE_INFINITY };

function betterMatch(a?: FuzzyMatch, b?: FuzzyMatch): FuzzyMatch | undefined {
	if (!a) return b;
	if (!b) return a;
	if (a.score !== b.score) return a.score > b.score ? a : b;
	return a.startIndex <= b.startIndex ? a : b;
}

/**
 * Matches `input` against `target` in order. Each matched character is worth
 * one point, with one additional point for every contiguous pair.
 */
function findBestMatch(input: string, target: string): FuzzyMatch {
	if (!input) return { score: CHARACTER_SCORE, startIndex: 0 };

	const query = input.toLowerCase();
	const candidate = target.toLowerCase();
	if (query.length > candidate.length) return NO_MATCH;

	const matches: Array<Array<FuzzyMatch | undefined>> = Array.from(
		{ length: query.length },
		() => new Array<FuzzyMatch | undefined>(candidate.length),
	);

	for (let queryIndex = 0; queryIndex < query.length; queryIndex++) {
		let bestWithGap: FuzzyMatch | undefined;

		for (let candidateIndex = queryIndex; candidateIndex < candidate.length; candidateIndex++) {
			if (queryIndex > 0 && candidateIndex >= 2) {
				bestWithGap = betterMatch(bestWithGap, matches[queryIndex - 1][candidateIndex - 2]);
			}
			if (candidate[candidateIndex] !== query[queryIndex]) continue;

			if (queryIndex === 0) {
				matches[queryIndex][candidateIndex] = {
					score: CHARACTER_SCORE,
					startIndex: candidateIndex,
				};
				continue;
			}

			const previous = matches[queryIndex - 1][candidateIndex - 1];
			const contiguous = previous && {
				score: previous.score + CHARACTER_SCORE + CONTIGUOUS_BONUS,
				startIndex: previous.startIndex,
			};
			const withGap = bestWithGap && {
				score: bestWithGap.score + CHARACTER_SCORE,
				startIndex: bestWithGap.startIndex,
			};

			matches[queryIndex][candidateIndex] = betterMatch(contiguous, withGap);
		}
	}

	return matches.at(-1)?.reduce((best, match) => betterMatch(best, match), undefined) ?? NO_MATCH;
}

export function fuzzyScore(input: string, target: string): number {
	return findBestMatch(input, target).score;
}

type OptionLike = { label?: string; value: string };

/**
 * Ranks matches by score, earliest match position, then label. An empty query
 * preserves the original option order.
 */
export function rankedOptionsFn<T extends OptionLike>(options: T[]) {
	return function (this: { userInput?: string }): T[] {
		const input = this?.userInput ?? "";
		if (!input) return options;

		return options
			.map((option, index) => {
				const label = option.label ?? String(option.value);
				return { option, index, label, match: findBestMatch(input, label) };
			})
			.filter(({ match }) => match.score > 0)
			.sort(
				(a, b) =>
					b.match.score - a.match.score ||
					a.match.startIndex - b.match.startIndex ||
					a.label.localeCompare(b.label) ||
					a.index - b.index,
			)
			.map(({ option }) => option);
	};
}
