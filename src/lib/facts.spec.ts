import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { required } from './required';
import { seriesOf, stateRow, statesOfYear } from './series';
import type { StateRow } from './types';

// The numbers in the sentences about the years and the analyses come from the specification (a support document,
// outside the repository). This test checks each one against the data file, so nothing wrong reaches the screen.
const states = JSON.parse(
	readFileSync(new URL('../../data/ready/idhm_states.json', import.meta.url), 'utf-8')
) as StateRow[];

test('2024: Brazil 0.805; DF 0.866 (highest); Maranhão 0.745 (lowest)', () => {
	expect(required(stateRow(states, 'BR', 2024), 'Brazil 2024').idhm).toBe(0.805);
	const states2024 = statesOfYear(states, 2024).sort((a, b) => b.idhm - a.idhm);
	expect(states2024[0].code).toBe('DF');
	expect(states2024[0].idhm).toBe(0.866);
	expect(states2024[states2024.length - 1].code).toBe('MA');
	expect(states2024[states2024.length - 1].idhm).toBe(0.745);
});

test('2024: every state is high or very high; 10 above 0.800', () => {
	const states2024 = statesOfYear(states, 2024);
	expect(states2024.every((row) => row.idhm >= 0.7)).toBe(true);
	expect(states2024.filter((row) => row.idhm >= 0.8)).toHaveLength(10);
});

test('1991: 20 states in very low; the highest is DF, 0.616', () => {
	const states1991 = statesOfYear(states, 1991);
	expect(states1991.filter((row) => row.idhm < 0.5)).toHaveLength(20);
	const highest = states1991.reduce((a, b) => (b.idhm > a.idhm ? b : a));
	expect(highest.code).toBe('DF');
	expect(highest.idhm).toBe(0.616);
});

test('2010: no state below 0.600; only DF above 0.800', () => {
	const states2010 = statesOfYear(states, 2010);
	expect(states2010.every((row) => row.idhm >= 0.6)).toBe(true);
	const above = states2010.filter((row) => row.idhm > 0.8);
	expect(above.map((row) => row.code)).toEqual(['DF']);
});

test('Maranhão in 1991 = 0.357 (reference value of the check)', () => {
	expect(required(stateRow(states, 'MA', 1991), 'Maranhão 1991').idhm).toBe(0.357);
});

test('largest gains from 1991 to 2024: TO, PI, MA, RO, PB, in that order', () => {
	const gains = statesOfYear(states, 2024).map((end) => {
		const start = required(stateRow(states, end.code, 1991), `${end.code} 1991`);
		return { code: end.code, gain: Math.round((end.idhm - start.idhm) * 1000) / 1000 };
	});
	gains.sort((a, b) => b.gain - a.gain);
	expect(gains.slice(0, 5).map((g) => g.code)).toEqual(['TO', 'PI', 'MA', 'RO', 'PB']);
	expect(gains[0].gain).toBe(0.428);
	expect(gains[4].gain).toBe(0.378);
});

test('Brazil: education was the dimension that rose the most, from 0.279 to 0.798', () => {
	const brazilSeries = seriesOf(states, 'code', 'BR');
	const start = required(brazilSeries[0], 'Brazil, first year');
	const end = required(brazilSeries[brazilSeries.length - 1], 'Brazil, last year');
	expect(start.year).toBe(1991);
	expect(end.year).toBe(2024);
	expect(start.education).toBe(0.279);
	expect(end.education).toBe(0.798);
});

test('Brazil in 1991, the example of the geometric mean: a simple average would be 0.529, the IDHM was 0.493', () => {
	const brazil = required(stateRow(states, 'BR', 1991), 'Brazil 1991');
	expect(brazil).toMatchObject({ longevity: 0.662, education: 0.279, income: 0.647, idhm: 0.493 });
	const simple = (brazil.longevity + brazil.education + brazil.income) / 3;
	expect(Math.round(simple * 1000) / 1000).toBe(0.529);
	const geometric = Math.cbrt(brazil.longevity * brazil.education * brazil.income);
	expect(Math.round(geometric * 1000) / 1000).toBe(0.493);
});
