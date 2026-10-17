/**
 * Evolution sub-tab: the places that can be compared in the fixed chart or put in focus in the detail chart
 * (Brazil, the five regions and the 27 states), their order in the lists, and the lines of the two charts.
 * The functions are pure: they only read the rows they receive.
 */
import { positions } from './ranking';
import { BRAZIL_COLOR, idhmBand, LINE_DASH, YEARS } from './scales';
import { seriesOf, statesOfYear } from './series';
import { num, position } from './format';
import { t, type TextKey } from './texts';
import type { ChartSeries, LineStyle, Measure, RegionCode, RegionRow, StateRow } from './types';

/** A place in a year: Brazil, a region or a state. Only the states have a `source` in the data file. */
type PlaceRow = { year: number; name: string } & Record<Measure, number>;

/** Key of Brazil in the lines and in the focus. It is the code the Atlas uses for the country. */
export const BRAZIL_KEY = 'BR';

// A region key carries a prefix because two codes would clash: "SE" is Sergipe and also the Southeast.
const REGION_PREFIX = 'region:';

export function regionKey(code: RegionCode): string {
	return `${REGION_PREFIX}${code}`;
}

/** The region code of a key, or null when the key is Brazil or a state. */
export function regionOf(key: string): RegionCode | null {
	return key.startsWith(REGION_PREFIX) ? (key.slice(REGION_PREFIX.length) as RegionCode) : null;
}

/**
 * The regions in alphabetical order, each with its states by name (Distrito Federal, Goiás, Mato Grosso, Mato Grosso
 * do Sul). This is the order of the line selector and of the focus list. A test checks it against the data files.
 */
export const REGION_GROUPS: { code: RegionCode; states: string[] }[] = [
	{ code: 'CO', states: ['DF', 'GO', 'MT', 'MS'] },
	{ code: 'NE', states: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'] },
	{ code: 'N', states: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'] },
	{ code: 'SE', states: ['ES', 'MG', 'RJ', 'SP'] },
	{ code: 'S', states: ['PR', 'RS', 'SC'] }
];

export function regionName(code: RegionCode): string {
	return t(`region.${code}` as TextKey);
}

/** Name of a line in the interface: the region, Brazil or, for a state, its two-letter code. */
export function labelOf(key: string): string {
	const region = regionOf(key);
	if (region) return regionName(region);
	return key === BRAZIL_KEY ? t('general.brazil') : key;
}

/** Line style: regions are averages, so dashed; states are continuous; the fifth line is always dotted (D7). */
export function lineStyleOf(key: string, positionInList: number): LineStyle {
	if (positionInList === 4) return 'dotted';
	return regionOf(key) ? 'dashed' : 'solid';
}

/** Rows of a place in every year, in year order. Brazil and the states come from the Atlas file; the regions, from regions.json. */
export function historyOf(key: string, states: StateRow[], regions: RegionRow[]): PlaceRow[] {
	const region = regionOf(key);
	return region ? seriesOf(regions, 'region', region) : seriesOf(states, 'code', key);
}

/** Name of a place in full: "Maranhão", "Nordeste" or "Brasil". Empty if the place has no rows. */
export function nameOf(key: string, states: StateRow[], regions: RegionRow[]): string {
	const region = regionOf(key);
	if (region) return regionName(region);
	return historyOf(key, states, regions)[0]?.name ?? '';
}

/**
 * Lines of the comparison chart: Brazil, thick and always there, then the lines turned on, in the order they were
 * turned on. `lines` maps each key to its color.
 */
export function compareSeries(
	lines: Record<string, string>,
	measure: Measure,
	states: StateRow[],
	regions: RegionRow[]
): ChartSeries[] {
	const pointsOf = (key: string) => historyOf(key, states, regions).map((row) => ({ year: row.year, value: row[measure] }));
	const brazil: ChartSeries = {
		key: BRAZIL_KEY,
		label: labelOf(BRAZIL_KEY),
		color: BRAZIL_COLOR,
		width: 3,
		points: pointsOf(BRAZIL_KEY)
	};
	const linked = Object.entries(lines).map(
		([key, color], index): ChartSeries => ({
			key,
			label: labelOf(key),
			color,
			dash: LINE_DASH[lineStyleOf(key, index)],
			points: pointsOf(key)
		})
	);
	return [brazil, ...linked];
}

/**
 * Highlight line of the detail chart, in the last year: "IDHM em 2024: 0,745 – alto | 27º / 27 estados".
 * A state is placed among the 27 states, and a region among the five; Brazil has no position.
 */
export function focusHighlight(key: string, states: StateRow[], regions: RegionRow[]): string {
	const year = YEARS[YEARS.length - 1];
	const row = historyOf(key, states, regions).find((r) => r.year === year);
	if (!row) return '';
	const values = { year, value: num(row.idhm), band: t(`band.${idhmBand(row.idhm)}`) };
	const region = regionOf(key);
	if (region) {
		const peers = regions.filter((r) => r.year === year).map((r) => ({ ...r, code: r.region }));
		return t('focus.highlight.region', { ...values, position: position(positions(peers, 'idhm').get(region) ?? 0) });
	}
	if (key === BRAZIL_KEY) return t('focus.highlight.brazil', values);
	return t('focus.highlight.state', {
		...values,
		position: position(positions(statesOfYear(states, year), 'idhm').get(key) ?? 0)
	});
}
