import { YEARS } from './scales';

const FIRST = YEARS[0];
const LAST = YEARS[YEARS.length - 1];

/**
 * Position of a year on the timeline, from 0 to 100. The timeline is proportional to the years: 2010 and 2012 are
 * two years apart, and the change of survey shows as a gap.
 */
export function percentOfYear(year: number): number {
	return ((year - FIRST) / (LAST - FIRST)) * 100;
}

/** Index of the year with data closest to a fraction from 0 to 1 of the timeline. A tie goes to the earlier year. */
export function nearestIndex(fraction: number): number {
	const target = FIRST + fraction * (LAST - FIRST);
	let best = 0;
	for (let i = 1; i < YEARS.length; i++) {
		if (Math.abs(YEARS[i] - target) < Math.abs(YEARS[best] - target)) best = i;
	}
	return best;
}
