/**
 * Shared state of the blocks. Only the functions of this file change the values, so the rules
 * (years with data, at most 5 lines, stable colors) live in one place.
 */
import { LINE_COLORS, MAX_LINES, YEARS } from './scales';
import type { Action, Measure, SubTab } from './types';

const COLORBLIND_KEY = 'dash-idh:colorblind';

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
	selectedCode: null as string | null,
	subtab: 'map' as SubTab,
	/** Colorblind palette on (see mapColor). */
	colorblind: readColorblind(),
	playing: false,
	/** Lines on in the comparison: key -> color. Up to MAX_LINES, besides Brazil. */
	lines: {
		world: LINE_COLORS[0],
		brics: LINE_COLORS[1],
		USA: LINE_COLORS[2],
		CHN: LINE_COLORS[3]
	} as Record<string, string>
});

/** Takes the map and the charts to a year with data. */
export function goToYear(year: number): void {
	if (!YEARS.includes(year)) throw new Error(`No data for year: ${year}`);
	store.year = year;
}

/**
 * Turns a comparison line on or off. Returns false when the limit blocks the action.
 * A new line takes the first free color; the others keep theirs.
 */
export function toggleLine(key: string): boolean {
	if (key in store.lines) {
		delete store.lines[key];
		return true;
	}
	if (Object.keys(store.lines).length >= MAX_LINES) return false;
	const used = Object.values(store.lines);
	store.lines[key] = LINE_COLORS.find((color) => !used.includes(color)) ?? LINE_COLORS[0];
	return true;
}

/** Takes the Brazil tab to the view of an analysis: measure, year, state and sub-tab. Stops the animation if it is playing. */
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
