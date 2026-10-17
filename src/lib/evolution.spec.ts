import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import {
	BRAZIL_KEY,
	compareSeries,
	focusHighlight,
	historyOf,
	labelOf,
	lineStyleOf,
	nameOf,
	REGION_GROUPS,
	regionKey,
	regionName,
	regionOf
} from './evolution';
import { LINE_COLORS } from './scales';
import type { MapTopology, RegionRow, StateProps, StateRow } from './types';

const read = <T>(name: string) => JSON.parse(readFileSync(new URL(`../../data/ready/${name}`, import.meta.url), 'utf-8')) as T;
const states = read<StateRow[]>('idhm_states.json');
const regions = read<RegionRow[]>('regions.json');
const topology = read<MapTopology>('br_states.topojson');

test('the selector order: regions in alphabetical order, then the states of each by name', () => {
	const names = REGION_GROUPS.map((g) => regionName(g.code));
	expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pt-BR')));
	const nameOfState = new Map(states.map((row) => [row.code, row.name]));
	for (const group of REGION_GROUPS) {
		const stateNames = group.states.map((code) => nameOfState.get(code) ?? '');
		expect(stateNames).toEqual([...stateNames].sort((a, b) => a.localeCompare(b, 'pt-BR')));
	}
});

test('the groups hold the 27 states once, and each state is in the region of its IBGE code', () => {
	const all = REGION_GROUPS.flatMap((g) => g.states);
	expect(all).toHaveLength(27);
	expect(new Set(all).size).toBe(27);
	// The first digit of the IBGE state code is the region: 1 North, 2 Northeast, 3 Southeast, 4 South, 5 Centre-West.
	const regionOfDigit = { '1': 'N', '2': 'NE', '3': 'SE', '4': 'S', '5': 'CO' } as const;
	for (const geometry of topology.objects.states.geometries) {
		const { code, state } = geometry.properties as StateProps;
		const group = REGION_GROUPS.find((g) => g.states.includes(state));
		expect(group?.code, state).toBe(regionOfDigit[code[0] as keyof typeof regionOfDigit]);
	}
	for (const group of REGION_GROUPS) {
		expect(regions.find((r) => r.region === group.code)?.n_states).toBe(group.states.length);
	}
});

test('a region key does not clash with a state code: SE is Sergipe, and region:SE is the Southeast', () => {
	expect(regionOf('region:SE')).toBe('SE');
	expect(regionOf('SE')).toBeNull();
	expect(regionKey('NE')).toBe('region:NE');
	expect(historyOf('SE', states, regions)[0].name).toBe('Sergipe');
	expect(historyOf('region:SE', states, regions)[0].name).toBe('Sudeste');
	expect(nameOf('region:SE', states, regions)).toBe('Sudeste');
	expect(nameOf('MA', states, regions)).toBe('Maranhão');
	expect(nameOf(BRAZIL_KEY, states, regions)).toBe('Brasil');
});

test('labels: regions by name, states by code, Brazil as Brasil', () => {
	expect(labelOf('region:CO')).toBe('Centro-Oeste');
	expect(labelOf('MA')).toBe('MA');
	expect(labelOf('BR')).toBe('Brasil');
});

test('line style: regions dashed, states continuous, and the fifth line dotted', () => {
	expect(lineStyleOf('region:N', 0)).toBe('dashed');
	expect(lineStyleOf('MA', 1)).toBe('solid');
	expect(lineStyleOf('MA', 4)).toBe('dotted');
	expect(lineStyleOf('region:N', 4)).toBe('dotted');
});

test('the comparison has Brazil first, thick, then the lines in the order they were turned on', () => {
	const lines = { 'region:NE': LINE_COLORS[0], MA: LINE_COLORS[1] };
	const series = compareSeries(lines, 'idhm', states, regions);
	expect(series.map((s) => s.key)).toEqual(['BR', 'region:NE', 'MA']);
	expect(series[0].width).toBe(3);
	expect(series[1]).toMatchObject({ label: 'Nordeste', color: LINE_COLORS[0], dash: '8 5' });
	expect(series[2]).toMatchObject({ label: 'MA', color: LINE_COLORS[1], dash: undefined });
	expect(series[1].points.find((p) => p.year === 1991)?.value).toBe(0.393);
	expect(series[2].points.find((p) => p.year === 2024)?.value).toBe(0.745);
	expect(series[0].points).toHaveLength(16);
});

test('the comparison follows the measure chosen', () => {
	const series = compareSeries({ 'region:NE': LINE_COLORS[0] }, 'education', states, regions);
	expect(series[1].points.find((p) => p.year === 1991)?.value).toBe(0.198);
	expect(series[0].points.find((p) => p.year === 2024)?.value).toBe(0.798);
});

test('the highlight of the detail: Brazil, a state among 27 and a region among 5, in 2024', () => {
	expect(focusHighlight('BR', states, regions)).toBe('IDHM em 2024: 0,805 – muito alto');
	expect(focusHighlight('MA', states, regions)).toBe('IDHM em 2024: 0,745 – alto | 27º / 27 estados');
	expect(focusHighlight('DF', states, regions)).toBe('IDHM em 2024: 0,866 – muito alto | 1º / 27 estados');
	expect(focusHighlight('region:NE', states, regions)).toBe('IDHM em 2024: 0,761 – alto | 5º / 5 regiões');
	expect(focusHighlight('region:S', states, regions)).toBe('IDHM em 2024: 0,824 – muito alto | 1º / 5 regiões');
	expect(focusHighlight('XX', states, regions)).toBe('');
});
