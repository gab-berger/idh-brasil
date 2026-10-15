import { readFileSync } from 'node:fs';
import { interpolateRdYlBu, interpolateYlGnBu, rgb } from 'd3';
import { expect, test } from 'vitest';
import { BRAZIL_COLOR, DIMENSION_COLORS, DOMAINS, hdiBand, idhmBand, LINE_COLORS, mapColor, positionInDomain, REGION_COLORS, YEARS } from './scales';
import type { Measure, StateRow } from './types';

const stateData = JSON.parse(
	readFileSync(new URL('../../data/ready/idhm_states.json', import.meta.url), 'utf-8')
) as StateRow[];

/** Light-theme value of a token color, so the contrast check runs on a real color. */
function lightValue(color: string): string {
	return { 'var(--brazil)': '#D55E00', 'var(--chart-ink)': '#000000', 'var(--chart-blue)': '#0072B2' }[color] ?? color;
}

/** WCAG contrast of a #RRGGBB color on a white background. */
function contrastOnWhite(hex: string): number {
	const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
	const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return 1.05 / (luminance + 0.05);
}

test('IDHM bands at the edges', () => {
	expect(idhmBand(0.499)).toBe('very_low');
	expect(idhmBand(0.5)).toBe('low');
	expect(idhmBand(0.599)).toBe('low');
	expect(idhmBand(0.6)).toBe('medium');
	expect(idhmBand(0.699)).toBe('medium');
	expect(idhmBand(0.7)).toBe('high');
	expect(idhmBand(0.799)).toBe('high');
	expect(idhmBand(0.8)).toBe('very_high');
});

test('global HDI bands at the edges', () => {
	expect(hdiBand(0.549)).toBe('low');
	expect(hdiBand(0.55)).toBe('medium');
	expect(hdiBand(0.699)).toBe('medium');
	expect(hdiBand(0.7)).toBe('high');
	expect(hdiBand(0.799)).toBe('high');
	expect(hdiBand(0.8)).toBe('very_high');
});

test('the two scales put Brazil in different bands', () => {
	// IDHM 2024 = 0.805 (very high) and global HDI 2023 = 0.786 (high): the delicate point of the specification.
	expect(idhmBand(0.805)).toBe('very_high');
	expect(hdiBand(0.786)).toBe('high');
});

test('16 years with data: no 2011, with 2010 and 2012', () => {
	expect(YEARS).toHaveLength(16);
	expect(YEARS).not.toContain(2011);
	expect(YEARS).toContain(2010);
	expect(YEARS).toContain(2012);
	expect(YEARS[0]).toBe(1991);
	expect(YEARS[YEARS.length - 1]).toBe(2024);
});

test('the fixed domains cover every value of the series', () => {
	for (const [measure, [min, max]] of Object.entries(DOMAINS) as [Measure, [number, number]][]) {
		const values = stateData.map((row) => row[measure]);
		expect(Math.min(...values)).toBeGreaterThanOrEqual(min);
		expect(Math.max(...values)).toBeLessThanOrEqual(max);
	}
});

test('the default palette goes from red (lowest value) to blue (highest value), and stops at the edges', () => {
	expect(mapColor('idhm')(0.35)).toBe(interpolateRdYlBu(0));
	expect(mapColor('idhm')(0.9)).toBe(interpolateRdYlBu(1));
	expect(mapColor('idhm')(0.2)).toBe(interpolateRdYlBu(0));
	const low = rgb(mapColor('idhm')(0.35));
	const high = rgb(mapColor('idhm')(0.9));
	expect(low.r).toBeGreaterThan(low.b);
	expect(high.b).toBeGreaterThan(high.r);
});

test('the colorblind palette is yellow, green and blue, and it changes the map color', () => {
	expect(mapColor('idhm', true)(0.35)).toBe(interpolateYlGnBu(0));
	expect(mapColor('idhm', true)(0.9)).toBe(interpolateYlGnBu(1));
	expect(mapColor('idhm', true)(0.9)).not.toBe(mapColor('idhm')(0.9));
});

test('every line, dimension and region color has a 3:1 contrast or more on white', () => {
	const colors = [
		BRAZIL_COLOR,
		...LINE_COLORS,
		...Object.values(DIMENSION_COLORS),
		...Object.values(REGION_COLORS).map((region) => region.color)
	];
	for (const color of colors) {
		expect(contrastOnWhite(lightValue(color))).toBeGreaterThanOrEqual(3);
	}
});

test('position in the domain: 0 at the minimum, 1 at the maximum, never outside 0 to 1', () => {
	expect(positionInDomain(0.35, DOMAINS.idhm)).toBe(0);
	expect(positionInDomain(0.9, DOMAINS.idhm)).toBe(1);
	expect(positionInDomain(0.625, DOMAINS.idhm)).toBeCloseTo(0.5);
	expect(positionInDomain(0.2, DOMAINS.idhm)).toBe(0);
	expect(positionInDomain(1, DOMAINS.idhm)).toBe(1);
});
