import { readFileSync } from 'node:fs';
import { interpolateRdYlBu, interpolateYlGnBu, rgb } from 'd3';
import { expect, test } from 'vitest';
import { BRAZIL_COLOR, DIMENSION_COLORS, hdiBand, idhmBand, LINE_COLORS, MEASURES, mapColor, positionInDomain, VALUE_DOMAIN, YEARS } from './scales';
import { t } from './texts';
import type { HdiBand, IdhmBand, StateRow } from './types';

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

test('the one scale covers every value of the four measures', () => {
	const [min, max] = VALUE_DOMAIN;
	for (const measure of MEASURES) {
		const values = stateData.map((row) => row[measure]);
		expect(Math.min(...values)).toBeGreaterThanOrEqual(min);
		expect(Math.max(...values)).toBeLessThanOrEqual(max);
	}
});

test('the default palette goes from red (lowest value) to blue (highest value), and stops at the edges', () => {
	expect(mapColor()(0.15)).toBe(interpolateRdYlBu(0));
	expect(mapColor()(0.95)).toBe(interpolateRdYlBu(1));
	expect(mapColor()(0.1)).toBe(interpolateRdYlBu(0));
	const low = rgb(mapColor()(0.2));
	const high = rgb(mapColor()(0.9));
	expect(low.r).toBeGreaterThan(low.b);
	expect(high.b).toBeGreaterThan(high.r);
});

test('the colorblind palette is yellow, green and blue, and it changes the map color', () => {
	expect(mapColor(true)(0.15)).toBe(interpolateYlGnBu(0));
	expect(mapColor(true)(0.95)).toBe(interpolateYlGnBu(1));
	expect(mapColor(true)(0.9)).not.toBe(mapColor()(0.9));
});

test('every line and dimension color has a 3:1 contrast or more on white', () => {
	const colors = [BRAZIL_COLOR, ...LINE_COLORS, ...Object.values(DIMENSION_COLORS)];
	for (const color of colors) {
		expect(contrastOnWhite(lightValue(color))).toBeGreaterThanOrEqual(3);
	}
});

test('position in the scale: 0 at the minimum, 1 at the maximum, never outside 0 to 1', () => {
	expect(positionInDomain(0.15, VALUE_DOMAIN)).toBe(0);
	expect(positionInDomain(0.95, VALUE_DOMAIN)).toBe(1);
	expect(positionInDomain(0.55, VALUE_DOMAIN)).toBeCloseTo(0.5);
	expect(positionInDomain(0.1, VALUE_DOMAIN)).toBe(0);
	expect(positionInDomain(1, VALUE_DOMAIN)).toBe(1);
});

/** Lowest and highest value of a band, as the Informações page writes it: "0,500 a 0,599", "abaixo de 0,550", "0,800 ou mais". */
function bandLimits(text: string): [number, number] {
	const numbers = (text.match(/\d+(,\d+)?/g) ?? []).map((n) => Number(n.replace(',', '.')));
	if (text.startsWith('abaixo de')) return [0, numbers[0] - 0.001];
	if (text.endsWith('ou mais')) return [numbers[0], 1];
	return [numbers[0], numbers[1]];
}

test('the band table of the Informações page agrees with the band functions, with no gap between bands', () => {
	const idhmBands: IdhmBand[] = ['very_low', 'low', 'medium', 'high', 'very_high'];
	const idhmLimits = idhmBands.map((band) => bandLimits(t(`about.bands.idhm.${band}`)));
	idhmBands.forEach((band, i) => {
		expect(idhmBand(idhmLimits[i][0])).toBe(band);
		expect(idhmBand(idhmLimits[i][1])).toBe(band);
	});
	const hdiBands: HdiBand[] = ['low', 'medium', 'high', 'very_high'];
	const hdiLimits = hdiBands.map((band) => bandLimits(t(`about.bands.hdi.${band}`)));
	hdiBands.forEach((band, i) => {
		expect(hdiBand(hdiLimits[i][0])).toBe(band);
		expect(hdiBand(hdiLimits[i][1])).toBe(band);
	});
	for (const limits of [idhmLimits, hdiLimits]) {
		expect(limits[0][0]).toBe(0);
		expect(limits[limits.length - 1][1]).toBe(1);
		for (let i = 1; i < limits.length; i++) expect(limits[i][0]).toBeCloseTo(limits[i - 1][1] + 0.001);
	}
});
