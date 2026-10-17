/**
 * Shared state of the blocks. Only the functions of this file change the values, so the rules
 * (years with data, at most 5 lines, stable colors) live in one place.
 */
import { regionKey } from './evolution';
import { LINE_COLORS, MAX_LINES, REGIONS, YEARS } from './scales';
import type { Action, Measure, SubTab } from './types';

const COLORBLIND_KEY = 'idh-brasil:colorblind';

/** Preference saved in this browser. Without storage (private browsing, blocked data), the default applies. */
function readColorblind(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return window.localStorage.getItem(COLORBLIND_KEY) === '1';
	} catch {
		return false;
	}
}

export const store = $state({
	year: 2024,
	measure: 'idhm' as Measure,
	/** The place chosen on the map, in the ranking or in the evolution tab: a state code or a region key. Null is none (Brazil, in the evolution tab). */
	selectedCode: null as string | null,
	subtab: 'map' as SubTab,
	/** Year of the world ranking, shared by its controls and its list. Null until the data is read. */
	worldRankingYear: null as number | null,
	/** Colorblind palette on (see mapColor). */
	colorblind: readColorblind(),
	playing: false,
	/** Lines on in the comparison: key -> color. Up to MAX_LINES, besides Brazil. */
	lines: {
		world: LINE_COLORS[0],
		brics: LINE_COLORS[1],
		USA: LINE_COLORS[2],
		CHN: LINE_COLORS[3]
	} as Record<string, string>,
	/** Lines on in the comparison of regions and states: key -> color. Up to MAX_LINES, besides Brazil. Opens with the five regions. */
	compare: Object.fromEntries(REGIONS.map((code, index) => [regionKey(code), LINE_COLORS[index % LINE_COLORS.length]])) as Record<
		string,
		string
	>
});

/** Takes the map and the charts to a year with data. */
export function goToYear(year: number): void {
	if (!YEARS.includes(year)) throw new Error(`No data for year: ${year}`);
	store.year = year;
}

/**
 * Turns a line of a set on or off. Returns false when the limit blocks the action.
 * A new line takes the first free color; the others keep theirs.
 */
function toggleIn(lines: Record<string, string>, key: string): boolean {
	if (key in lines) {
		delete lines[key];
		return true;
	}
	if (Object.keys(lines).length >= MAX_LINES) return false;
	const used = Object.values(lines);
	lines[key] = LINE_COLORS.find((color) => !used.includes(color)) ?? LINE_COLORS[0];
	return true;
}

/** Turns a line of the world comparison on or off. */
export function toggleLine(key: string): boolean {
	return toggleIn(store.lines, key);
}

/** Turns a line of the comparison of regions and states on or off. */
export function toggleCompare(key: string): boolean {
	return toggleIn(store.compare, key);
}

/** Takes the Brazil tab to the view of an analysis: measure, year, place and sub-tab. Stops the animation if it is playing. */
export function goToView(action: Action): void {
	store.playing = false;
	if (action.measure) store.measure = action.measure;
	if (action.year !== undefined) goToYear(action.year);
	if (action.code !== undefined) store.selectedCode = action.code;
	store.subtab = action.target;
}

/** Selects a state; touching it again clears the selection. */
export function toggleState(code: string): void {
	store.selectedCode = store.selectedCode === code ? null : code;
}

/** Turns the colorblind palette on or off and keeps the choice in this browser. */
export function setColorblind(value: boolean): void {
	store.colorblind = value;
	try {
		window.localStorage.setItem(COLORBLIND_KEY, value ? '1' : '0');
	} catch {
		// Without storage, the choice lasts only for this visit.
	}
}
