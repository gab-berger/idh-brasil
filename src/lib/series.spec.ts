import { expect, test } from 'vitest';
import { seriesOf, stateRow, statesOfYear } from './series';

const rows = [
	{ code: 'DF', year: 2024, idhm: 0.866 },
	{ code: 'BR', year: 2024, idhm: 0.805 },
	{ code: 'DF', year: 1991, idhm: 0.616 },
	{ code: 'MA', year: 2024, idhm: 0.745 }
];

test('seriesOf filters by the field and sorts by year', () => {
	expect(seriesOf(rows, 'code', 'DF').map((row) => row.year)).toEqual([1991, 2024]);
});

test('stateRow finds the state in a year, or undefined if there is none', () => {
	expect(stateRow(rows, 'DF', 2024)?.idhm).toBe(0.866);
	expect(stateRow(rows, 'MA', 1991)).toBeUndefined();
});

test('statesOfYear leaves Brazil out', () => {
	expect(statesOfYear(rows, 2024).map((row) => row.code)).toEqual(['DF', 'MA']);
});
