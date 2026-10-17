/**
 * Scales, bands and colors of the interface. The values come from the specification (visual design and
 * data rules); nothing here is read from the data files.
 */
import { interpolateRdYlBu, interpolateYlGnBu, scaleSequential } from 'd3';
import type { Dimension, HdiBand, IdhmBand, LineStyle, Measure, RegionCode } from './types';

/** Years with data: census in 1991, 2000 and 2010; PNAD Contínua from 2012 to 2024. There is no 2011. */
export const YEARS: number[] = [1991, 2000, 2010, ...Array.from({ length: 13 }, (_, i) => 2012 + i)];

export const MEASURES: Measure[] = ['idhm', 'longevity', 'education', 'income'];

/**
 * The scale of every chart and of the map, for the four measures. It is the same whatever the measure, so a height
 * or a color means the same value in each of them. It covers the whole series (the lowest value is 0.155, the highest 0.913).
 */
export const VALUE_DOMAIN: [number, number] = [0.15, 0.95];

/**
 * IDHM bands: very low (0 to 0.499), low (0.500 to 0.599), medium (0.600 to 0.699),
 * high (0.700 to 0.799), very high (0.800 to 1).
 */
export function idhmBand(value: number): IdhmBand {
	if (value < 0.5) return 'very_low';
	if (value < 0.6) return 'low';
	if (value < 0.7) return 'medium';
	if (value < 0.8) return 'high';
	return 'very_high';
}

/**
 * Global HDI bands: low (below 0.550), medium (0.550 to 0.699), high (0.700 to 0.799),
 * very high (0.800 or more). These are not the IDHM bands.
 */
export function hdiBand(value: number): HdiBand {
	if (value < 0.55) return 'low';
	if (value < 0.7) return 'medium';
	if (value < 0.8) return 'high';
	return 'very_high';
}

/** Default palette of the map and the ranking: red for the lowest value, yellow in the middle, blue for the highest. */
const DEFAULT_PALETTE = interpolateRdYlBu;

/** Palette for colorblind readers (a reader's option): yellow, green and blue, from the lightest to the darkest. */
const COLORBLIND_PALETTE = interpolateYlGnBu;

/** Color scale of the map and of the bars: continuous, the same in every year and for every measure. */
export function mapColor(colorblind = false) {
	return scaleSequential(VALUE_DOMAIN, colorblind ? COLORBLIND_PALETTE : DEFAULT_PALETTE).clamp(true);
}

/**
 * Position of a value inside a scale: 0 at the minimum, 1 at the maximum.
 * Used for bar lengths, so the difference between states stays visible.
 */
export function positionInDomain(value: number, domain: [number, number]): number {
	const [min, max] = domain;
	return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/** Colors that are CSS variables (var(...)) follow the theme; see app.css. The others are fixed. */
/** Brazil's color in every line chart. */
export const BRAZIL_COLOR = 'var(--brazil)';

/** Colors of the comparison lines, by free position. Each line keeps its color until it is turned off. */
export const LINE_COLORS: string[] = ['var(--chart-ink)', 'var(--chart-blue)', '#009E73', '#CC79A7'];

/** Maximum lines on at the same time, besides Brazil. The fifth reuses a color and is dotted (D7). */
export const MAX_LINES = 5;

/** Order of the regions where the lines start on: from north to south. */
export const REGIONS: RegionCode[] = ['N', 'NE', 'CO', 'SE', 'S'];

/** Stroke patterns of the comparison lines: averages are dashed, and the fifth line is dotted (D7). */
export const LINE_DASH: Record<LineStyle, string | undefined> = { solid: undefined, dashed: '8 5', dotted: '2 4' };

/** Colors of the three components in the charts of the sub-indices. */
export const DIMENSION_COLORS: Record<Dimension, string> = {
	longevity: '#009E73',
	education: 'var(--chart-blue)',
	income: '#CC79A7'
};
