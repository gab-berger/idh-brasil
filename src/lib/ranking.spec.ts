import { expect, test } from 'vitest';
import { positions } from './ranking';
import { nearestIndex, percentOfYear } from './time';

/** A row with the four measures, which is what `positions` needs. */
const row = (code: string, idhm: number) => ({ code, idhm, education: 0, longevity: 0, income: 0 });

test('position: 1 is the highest, and ties share the position', () => {
	const pos = positions([row('A', 0.8), row('B', 0.7), row('C', 0.7), row('D', 0.6)], 'idhm');
	expect([pos.get('A'), pos.get('B'), pos.get('C'), pos.get('D')]).toEqual([1, 2, 2, 4]);
});

test('the timeline goes from 0 to 100 and is proportional to the years', () => {
	expect(percentOfYear(1991)).toBe(0);
	expect(percentOfYear(2024)).toBe(100);
	expect(percentOfYear(2000)).toBeCloseTo((9 / 33) * 100);
});

test('the timeline position picks the closest year with data', () => {
	expect(nearestIndex(0)).toBe(0);
	expect(nearestIndex(1)).toBe(15);
	// 2010.4 is closer to 2010 than to 2012
	expect(nearestIndex((2010.4 - 1991) / 33)).toBe(2);
	// 2011.4 is closer to 2012 than to 2010; 2011 does not exist
	expect(nearestIndex((2011.4 - 1991) / 33)).toBe(3);
});
