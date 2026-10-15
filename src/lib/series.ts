/** Queries over the rows of the data files. Pure functions: they read nothing, they only filter. */

/** Rows with `field === value`, in year order. */
export function seriesOf<T extends { year: number }>(rows: T[], field: keyof T, value: T[keyof T]): T[] {
	return rows.filter((row) => row[field] === value).sort((a, b) => a.year - b.year);
}

/** Row of a state in a year, or undefined if there is none. */
export function stateRow<T extends { code: string; year: number }>(rows: T[], code: string, year: number): T | undefined {
	return rows.find((row) => row.code === code && row.year === year);
}

/** Rows of the 27 states in a year (Brazil, code "BR", stays out). */
export function statesOfYear<T extends { code: string; year: number }>(rows: T[], year: number): T[] {
	return rows.filter((row) => row.year === year && row.code !== 'BR');
}
