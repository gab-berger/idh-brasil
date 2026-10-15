import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { brazilAnalyses } from './analysis';
import type { RegionRow, StateRow } from './types';

// Each analysis is checked, number by number, against the ready data files.
function read<T>(name: string): T {
	return JSON.parse(readFileSync(new URL(`../../data/ready/${name}`, import.meta.url), 'utf-8')) as T;
}

const analyses = brazilAnalyses(read<StateRow[]>('idhm_states.json'), read<RegionRow[]>('regions.json'));

function analysis(id: string) {
	const found = analyses.find((a) => a.id === id);
	if (!found) throw new Error(`No analysis ${id}`);
	return found;
}

test('four analyses, the regions first (it is the question of the tab)', () => {
	expect(analyses.map((a) => a.id)).toEqual(['regions', 'states', 'progress', 'dimensions']);
});

test('regions: the Northeast progressed the most, and the gap between the regions shrank', () => {
	expect(analysis('regions').text).toBe(
		'O Nordeste: a média dos seus estados foi de 0,393 em 1991 para 0,761 em 2024 (+0,368). A diferença entre a região mais alta e a mais baixa caiu de 0,140 para 0,063.'
	);
	expect(analysis('regions').action?.target).toBe('regions');
});

test('states: the gap between the highest and the lowest fell from 0.259 to 0.121', () => {
	expect(analysis('states').text).toBe(
		'Em 1991, a distância entre o maior e o menor IDHM estadual era de 0,259 (Distrito Federal, 0,616; Maranhão, 0,357). Em 2024, caiu para 0,121 (Distrito Federal, 0,866; Maranhão, 0,745).'
	);
	expect(analysis('states').action).toEqual({
		label: 'Ver 1991 no mapa',
		target: 'map',
		measure: 'idhm',
		year: 1991,
		code: null
	});
});

test('progress: the five that progressed the most and the three that progressed the least', () => {
	expect(analysis('progress').text).toBe(
		'De 1991 a 2024: Tocantins (+0,428), Piauí (+0,402), Maranhão (+0,388), Rondônia (+0,379) e Paraíba (+0,378). Os que menos avançaram foram Rio de Janeiro (+0,246), Distrito Federal (+0,250) e São Paulo (+0,260).'
	);
	expect(analysis('progress').action?.code).toBe('TO');
});

test('dimensions: education drove the progress of Brazil', () => {
	expect(analysis('dimensions').text).toBe(
		'Educação: o subíndice do Brasil foi de 0,279 em 1991 para 0,798 em 2024 (+0,519). No mesmo período, Longevidade subiu 0,198 e Renda subiu 0,113.'
	);
	expect(analysis('dimensions').action?.measure).toBe('education');
});
