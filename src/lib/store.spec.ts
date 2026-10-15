import { expect, test } from 'vitest';
import { LINE_COLORS } from './scales';
import { goToView, goToYear, setColorblind, store, toggleLine, toggleState } from './store.svelte';

test('opens with the world, BRICS, the USA and China, in that order, and with no state selected', () => {
	expect(Object.keys(store.lines)).toEqual(['world', 'brics', 'USA', 'CHN']);
	expect(store.year).toBe(2024);
	expect(store.measure).toBe('idhm');
	expect(store.selectedCode).toBeNull();
});

test('the sixth line is blocked', () => {
	expect(toggleLine('ARG')).toBe(true);
	expect(toggleLine('RUS')).toBe(false);
	expect(Object.keys(store.lines)).toHaveLength(5);
});

test('turning a line off does not change the color of the others; a new line takes a free color', () => {
	const bricsColor = store.lines.brics;
	toggleLine('world');
	expect(store.lines.brics).toBe(bricsColor);
	expect(toggleLine('RUS')).toBe(true);
	expect(store.lines.RUS).toBe(LINE_COLORS[0]);
});

test('goToYear accepts only years with data', () => {
	goToYear(2010);
	expect(store.year).toBe(2010);
	expect(() => goToYear(2011)).toThrow('No data for year');
});

test('toggleState selects and clears the same state', () => {
	toggleState('DF');
	expect(store.selectedCode).toBe('DF');
	toggleState('DF');
	expect(store.selectedCode).toBeNull();
});

test('the colorblind palette starts off, and turns on and off', () => {
	expect(store.colorblind).toBe(false);
	setColorblind(true);
	expect(store.colorblind).toBe(true);
	setColorblind(false);
	expect(store.colorblind).toBe(false);
});

test('goToView takes the map to the view of an analysis, and changes only what the analysis asks for', () => {
	goToView({ label: '', target: 'map', measure: 'education', year: 1991, code: 'TO' });
	expect([store.measure, store.year, store.selectedCode, store.subtab]).toEqual(['education', 1991, 'TO', 'map']);
	goToView({ label: '', target: 'regions', code: null });
	expect(store.selectedCode).toBeNull();
	expect([store.measure, store.year]).toEqual(['education', 1991]);
	expect(store.subtab).toBe('regions');
});
