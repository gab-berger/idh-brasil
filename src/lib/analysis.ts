/**
 * Ready-made analyses of the Brazil tab. They are computed at build time from the ready data files, so the page
 * comes out with the text even without JavaScript. Each number is checked in analysis.spec.ts.
 */
import { delta, joinList, num } from './format';
import { required } from './required';
import { stateRow, statesOfYear } from './series';
import { t } from './texts';
import type { Analysis, Dimension, RegionRow, StateRow } from './types';

const START = 1991;
const END = 2024;
const DIMENSIONS: Dimension[] = ['longevity', 'education', 'income'];

/** Rounds to the 3 decimals of the data, so a difference such as 0.198 does not become 0.19799999. */
function round3(value: number): number {
	return Math.round(value * 1000) / 1000;
}

function verbOf(before: number, after: number): string {
	return after < before ? t('analysis.fell') : t('analysis.rose');
}

/** Which region progressed the most, and whether the distance between the highest and the lowest region shrank. */
function regionMostProgressed(regions: RegionRow[]): Analysis {
	const ofYear = (year: number) => regions.filter((r) => r.year === year);
	const gap = (rows: RegionRow[]) => round3(Math.max(...rows.map((r) => r.idhm)) - Math.min(...rows.map((r) => r.idhm)));
	const first = ofYear(START);
	const last = ofYear(END);
	const gains = last
		.map((r) => {
			const before = required(first.find((x) => x.region === r.region), `${r.name} in ${START}`);
			return { name: r.name, before: before.idhm, after: r.idhm, gain: round3(r.idhm - before.idhm) };
		})
		.sort((a, b) => b.gain - a.gain);
	const best = required(gains[0], 'regions');
	const gapStart = gap(first);
	const gapEnd = gap(last);
	return {
		id: 'regions',
		title: t('analysis.regions.title'),
		text: t('analysis.regions.text', {
			region: best.name,
			start: num(best.before),
			end: num(best.after),
			year_start: START,
			year_end: END,
			change: delta(best.gain),
			verb: verbOf(gapStart, gapEnd),
			gap_start: num(gapStart),
			gap_end: num(gapEnd)
		}),
		action: { label: t('analysis.regions.action'), target: 'regions', measure: 'idhm' }
	};
}

/** Distance between the highest and the lowest state IDHM, in the first and in the last year. */
function gapBetweenStates(rows: StateRow[]): Analysis {
	const extremes = (year: number) => {
		const sorted = statesOfYear(rows, year).sort((a, b) => b.idhm - a.idhm || a.name.localeCompare(b.name, 'pt-BR'));
		const top = required(sorted[0], `states in ${year}`);
		const bottom = required(sorted[sorted.length - 1], `states in ${year}`);
		return { top, bottom, gap: round3(top.idhm - bottom.idhm) };
	};
	const start = extremes(START);
	const end = extremes(END);
	return {
		id: 'states',
		title: t('analysis.states.title'),
		text: t('analysis.states.text', {
			year_start: START,
			gap_start: num(start.gap),
			top_start: start.top.name,
			top_value_start: num(start.top.idhm),
			bottom_start: start.bottom.name,
			bottom_value_start: num(start.bottom.idhm),
			year_end: END,
			verb: verbOf(start.gap, end.gap),
			gap_end: num(end.gap),
			top_end: end.top.name,
			top_value_end: num(end.top.idhm),
			bottom_end: end.bottom.name,
			bottom_value_end: num(end.bottom.idhm)
		}),
		action: { label: t('analysis.states.action', { year: START }), target: 'map', measure: 'idhm', year: START, code: null }
	};
}

/** The 5 states that progressed the most in the IDHM, and the 3 that progressed the least. */
function statesMostProgressed(rows: StateRow[]): Analysis {
	const gains = statesOfYear(rows, END)
		.map((last) => {
			const first = required(stateRow(rows, last.code, START), `${last.name} in ${START}`);
			return { code: last.code, name: last.name, gain: round3(last.idhm - first.idhm) };
		})
		.sort((a, b) => b.gain - a.gain || a.name.localeCompare(b.name, 'pt-BR'));
	const item = (g: { name: string; gain: number }) => t('analysis.progress.item', { name: g.name, change: delta(g.gain) });
	const leader = required(gains[0], 'states');
	return {
		id: 'progress',
		title: t('analysis.progress.title'),
		text: t('analysis.progress.text', {
			year_start: START,
			year_end: END,
			list: joinList(gains.slice(0, 5).map(item)),
			last: joinList(gains.slice(-3).reverse().map(item))
		}),
		action: {
			label: t('analysis.progress.action', { name: leader.name }),
			target: 'map',
			measure: 'idhm',
			year: END,
			code: leader.code
		}
	};
}

/** Which Brazil dimension rose the most, and how much the other two rose. */
function dimensionLeader(rows: StateRow[]): Analysis {
	const start = required(stateRow(rows, 'BR', START), `Brazil in ${START}`);
	const end = required(stateRow(rows, 'BR', END), `Brazil in ${END}`);
	const dimensions = DIMENSIONS.map((d) => ({ d, before: start[d], after: end[d], gain: round3(end[d] - start[d]) })).sort(
		(a, b) => b.gain - a.gain
	);
	const [top, ...others] = dimensions;
	const name = t(`measure.${top.d}`);
	return {
		id: 'dimensions',
		title: t('analysis.dimensions.title'),
		text: t('analysis.dimensions.text', {
			dimension: name,
			start: num(top.before),
			end: num(top.after),
			year_start: START,
			year_end: END,
			change: delta(top.gain),
			others: joinList(
				others.map((o) =>
					t('analysis.dimensions.other', {
						dimension: t(`measure.${o.d}`),
						verb: verbOf(o.before, o.after),
						value: num(Math.abs(o.gain))
					})
				)
			)
		}),
		action: { label: t('analysis.dimensions.action', { dimension: name }), target: 'map', measure: top.d, year: END, code: null }
	};
}

/** The analyses of the Brazil tab, in the order they rotate: the regions first, which is the tab's question. */
export function brazilAnalyses(rows: StateRow[], regions: RegionRow[]): Analysis[] {
	return [regionMostProgressed(regions), gapBetweenStates(rows), statesMostProgressed(rows), dimensionLeader(rows)];
}
