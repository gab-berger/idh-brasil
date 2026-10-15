import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { COUNTRIES, GROUPS, highlightOfBrazil, labelOf, lineStyleOf, rankingOfYear, worldAnalyses } from './world';
import type { AverageRow, Country, CountryRow, RankingYears } from './types';

// The numbers of the world tab are checked against the ready data files.
const read = <T>(name: string): T =>
	JSON.parse(readFileSync(new URL(`../../data/ready/${name}`, import.meta.url), 'utf-8')) as T;
const countries = read<Country[]>('countries.json');
const countryRows = read<CountryRow[]>('hdi_countries.json');
const averages = read<AverageRow[]>('averages.json');
const ranking = read<RankingYears>('ranking_years.json');

test('highlight for 2023: HDI 0.786, high, at 84º of 193 countries', () => {
	expect(highlightOfBrazil(countries)).toBe('IDH global do Brasil em 2023: 0,786 – alto | 84º / 193 países');
});

test('ranking for 2023: 193 countries, 63 of them tied; Brazil and Palau share 84º', () => {
	const rows = rankingOfYear(ranking, 2023);
	expect(rows).toHaveLength(193);
	expect(rows.filter((r) => r.position === 84).map((r) => r.name)).toEqual(['Brasil', 'Palau']);
	expect(rows.filter((r) => r.tie)).toHaveLength(63);
	expect(rows.find((r) => r.isBrazil)).toMatchObject({ position: 84, hdi: 0.786, tie: true });
});

test('the 2023 ranking recalculated from the raw values matches the official HDR positions', () => {
	const rows = rankingOfYear(ranking, 2023);
	for (const country of countries.filter((c) => c.position_2023 !== null)) {
		expect(rows.find((r) => r.iso3 === country.iso3)?.position).toBe(country.position_2023);
	}
});

test('in 1990, only the countries with data appear: 141, in position order', () => {
	const rows = rankingOfYear(ranking, 1990);
	expect(rows).toHaveLength(141);
	const positions = rows.map((r) => r.position);
	expect(positions).toEqual([...positions].sort((a, b) => a - b));
});

test('evolution from 2000 to 2023 in three blocks: Brazil rose at almost the same pace as the world', () => {
	const analyses = worldAnalyses(countryRows, averages);
	expect(analyses.map((a) => a.text)).toEqual([
		'Entre 2000 e 2023, o IDH do Brasil subiu 0,096 e a média dos países subiu 0,105. Ou seja, o Brasil evoluiu quase no mesmo ritmo que o resto do mundo.',
		'O Brasil subiu mais que América Latina e Caribe, Europa e Oceania.',
		'Subiu menos que África, Ásia e BRICS.'
	]);
	expect(analyses.map((a) => a.title)).toEqual([
		'Qual o ritmo do Brasil em relação ao mundo?',
		'Quais grupos o Brasil superou no crescimento?',
		'Quais grupos superaram o Brasil no crescimento?'
	]);
});

test('line style: averages dashed, countries continuous, the fifth line dotted', () => {
	expect(lineStyleOf('world', 0)).toBe('dashed');
	expect(lineStyleOf('CHN', 2)).toBe('solid');
	expect(lineStyleOf('RUS', 4)).toBe('dotted');
});

test('every line has a name in the interface', () => {
	for (const key of [...GROUPS, ...COUNTRIES, 'BRA']) {
		expect(labelOf(key).length).toBeGreaterThan(0);
	}
});
