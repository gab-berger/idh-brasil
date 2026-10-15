import type { Measure } from './types';

/** Position of each state by the value of a measure: 1 is the highest. Ties share the position (1, 2, 2, 4). */
export function positions<T extends { code: string } & Record<Measure, number>>(
	rows: T[],
	measure: Measure
): Map<string, number> {
	return new Map(
		rows.map((row): [string, number] => [row.code, 1 + rows.filter((other) => other[measure] > row[measure]).length])
	);
}
