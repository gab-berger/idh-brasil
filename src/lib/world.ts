/**
 * World tab: Brazil's position in the ranking, the reading of the evolution, and the lines of the comparison.
 * The functions are pure. The build calls those that read files (highlight, ranking, evolution); the browser
 * calls those that build the lines of the chart.
 */
import { joinList, num, position } from './format';
import { required } from './required';
import { hdiBand } from './scales';
import { t, type TextKey } from './texts';
import type { Analysis, AverageRow, Country, CountryRow, LineStyle, RankingRow, RankingYears } from './types';

/** Comparison groups (averages of countries), in the order of the list of lines. */
export const GROUPS = ['world', 'africa', 'latin_america_caribbean', 'asia', 'europe', 'oceania', 'brics'];

/** Countries of the comparison, in the order of the list of lines. */
export const COUNTRIES = ['RUS', 'IND', 'CHN', 'ZAF', 'USA', 'ARG'];

// The averages of the groups start in 2000; that is why the evolution compares 2000 and 2023 for everyone.
const START_YEAR = 2000;
const END_YEAR = 2023;

type RankedCountry = Country & { position_2023: number; hdi_2023: number };

export function isAverage(key: string): boolean {
	return GROUPS.includes(key);
}

/** Line style: the fifth line is always dotted (D7); before that, averages are dashed and countries continuous. */
export function lineStyleOf(key: string, positionInList: number): LineStyle {
	if (positionInList === 4) return 'dotted';
	return isAverage(key) ? 'dashed' : 'solid';
}

/** Name of a line in the interface: a group, a country or Brazil. A test checks that every key exists. */
export function labelOf(key: string): string {
	return t(`series.${key}` as TextKey);
}

/** Points of a line, in year order. Averages come from averages.json; countries, from hdi_countries.json. */
export function pointsOf(key: string, countries: CountryRow[], averages: AverageRow[]): { year: number; value: number }[] {
	if (isAverage(key)) {
		return averages
			.filter((a) => a.group === key)
			.sort((a, b) => a.year - b.year)
			.map((a) => ({ year: a.year, value: a.hdi }));
	}
	return countries
		.filter((c) => c.iso3 === key)
		.sort((a, b) => a.year - b.year)
		.map((c) => ({ year: c.year, value: c.hdi }));
}

/** How much the HDI of a line rose from 2000 to 2023, with the 3 decimals of the data. */
function rise(key: string, countries: CountryRow[], averages: AverageRow[]): number | undefined {
	const points = pointsOf(key, countries, averages);
	const start = points.find((p) => p.year === START_YEAR);
	const end = points.find((p) => p.year === END_YEAR);
	if (!start || !end) return undefined;
	return Math.round((end.value - start.value) * 1000) / 1000;
}

/**
 * Answers the question of the tab in analysis blocks, in the format of the Brazil tab: the pace of Brazil against
 * the world, the groups Brazil surpassed and the groups that surpassed it. Computed at build time.
 */
export function worldAnalyses(countries: CountryRow[], averages: AverageRow[]): Analysis[] {
	const brazil = required(rise('BRA', countries, averages), 'Brazil evolution');
	const world = required(rise('world', countries, averages), 'world evolution');
	const gap = brazil - world;
	// A gap below 0.01 is "almost the same pace": the numbers already show the exact difference.
	const pace = Math.abs(gap) < 0.01 ? 'pace_equal' : gap < 0 ? 'pace_less' : 'pace_more';
	const groups = GROUPS.filter((g) => g !== 'world').map((g) => ({
		key: g,
		rise: required(rise(g, countries, averages), `evolution of ${g}`)
	}));
	const above = groups.filter((g) => brazil > g.rise).map((g) => labelOf(g.key));
	const below = groups.filter((g) => brazil < g.rise).map((g) => labelOf(g.key));
	const analyses: Analysis[] = [
		{
			id: 'pace',
			title: t('world.analysis.pace'),
			text: t('world.evolution.text', {
				year_start: START_YEAR,
				year_end: END_YEAR,
				change_brazil: num(Math.abs(brazil)),
				change_world: num(Math.abs(world)),
				pace: t(`world.evolution.${pace}`)
			})
		},
		{
			id: 'surpassed',
			title: t('world.analysis.surpassed'),
			text: above.length > 0 ? t('world.evolution.more', { list: joinList(above) }) : t('world.evolution.more_none')
		}
	];
	if (below.length > 0) {
		analyses.push({
			id: 'outperformed',
			title: t('world.analysis.outperformed'),
			text: t('world.evolution.less', { list: joinList(below) })
		});
	}
	return analyses;
}

function hasRanking(country: Country): country is RankedCountry {
	return country.position_2023 !== null && country.hdi_2023 !== null;
}

/**
 * Highlight line of the world tab, in the format of the state tab:
 * "IDH global do Brasil em 2023: 0,786 – alto | 84º / 193 países".
 */
export function highlightOfBrazil(countries: Country[]): string {
	const brazil = required(
		countries.find((c) => c.iso3 === 'BRA'),
		'Brazil in the HDR'
	);
	const hdi = required(brazil.hdi_2023, 'Brazil HDI in 2023');
	const rank = required(brazil.position_2023, 'Brazil position in 2023');
	return t('highlight.world', {
		value: num(hdi),
		band: t(`band.${hdiBand(hdi)}`),
		position: position(rank),
		total: countries.filter(hasRanking).length
	});
}

/** Ranking of one year: the countries with data in it, in position order. Ties are marked. */
export function rankingOfYear(data: RankingYears, year: number): RankingRow[] {
	const index = data.years.indexOf(year);
	if (index < 0) return [];
	const rows = data.countries.flatMap((country): RankingRow[] => {
		const rank = country.position[index];
		const hdi = country.hdi[index];
		if (rank === null || hdi === null) return [];
		return [{ iso3: country.iso3, position: rank, name: country.name, hdi, isBrazil: country.iso3 === 'BRA', tie: false }];
	});
	const counts = new Map<number, number>();
	for (const row of rows) counts.set(row.position, (counts.get(row.position) ?? 0) + 1);
	return rows
		.map((row) => ({ ...row, tie: (counts.get(row.position) ?? 0) > 1 }))
		.sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, 'pt-BR'));
}
