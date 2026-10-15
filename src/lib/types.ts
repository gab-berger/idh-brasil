import type { GeometryCollection, Topology } from 'topojson-specification';

/** Measures of the Brazilian index (IDHM) and its three components. */
export type Measure = 'idhm' | 'longevity' | 'education' | 'income';

/** The three components. */
export type Dimension = 'longevity' | 'education' | 'income';

/** Bands of the state index, IDHM (see scales.ts). */
export type IdhmBand = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

/** Bands of the global HDI (see scales.ts). */
export type HdiBand = 'low' | 'medium' | 'high' | 'very_high';

/** Sub-tabs of the Brazil tab: the map, the ranking, the regional evolution or the state. */
export type SubTab = 'map' | 'ranking' | 'regions' | 'state';

/** One row of idhm_states.json: a state in a year ("BR" is Brazil). */
export interface StateRow {
	code: string;
	name: string;
	year: number;
	/** "Censo" up to 2010; "PNAD Contínua" from 2012 on. */
	source: string;
	idhm: number;
	education: number;
	longevity: number;
	income: number;
}

/** The five regions of Brazil, by code. */
export type RegionCode = 'N' | 'NE' | 'CO' | 'SE' | 'S';

/** One row of regions.json: the simple average of the states of a region, in a year. */
export interface RegionRow {
	region: RegionCode;
	name: string;
	year: number;
	idhm: number;
	education: number;
	longevity: number;
	income: number;
	n_states: number;
}

/** What an analysis does when the reader asks to see it: changes the map and scrolls to the target. */
export interface Action {
	label: string;
	target: SubTab;
	measure?: Measure;
	year?: number;
	/** null clears the state; missing leaves it alone. */
	code?: string | null;
}

/** A ready-made analysis, computed at build time. */
export interface Analysis {
	id: string;
	title: string;
	text: string;
	action?: Action;
}

/** One series of a line chart. */
export interface ChartSeries {
	key: string;
	label: string;
	color: string;
	/** SVG stroke-dasharray; missing means a continuous line. */
	dash?: string;
	width?: number;
	points: { year: number; value: number }[];
}

/** One row of hdi_countries.json: one of the countries of the comparison, in a year. */
export interface CountryRow {
	iso3: string;
	year: number;
	hdi: number;
	life_expectancy: number;
	expected_schooling: number;
	mean_schooling: number;
	income_pc: number;
}

/** One row of averages.json: the average of a group in a year. */
export interface AverageRow {
	group: string;
	year: number;
	hdi: number;
	n_countries: number;
}

/** Line style: continuous for countries, dashed for averages; the fifth line is always dotted (D7). */
export type LineStyle = 'solid' | 'dashed' | 'dotted';

/** A row of the world ranking. Countries that tie share the position, and `tie` is set. */
export interface RankingRow {
	iso3: string;
	position: number;
	name: string;
	hdi: number;
	isBrazil: boolean;
	tie: boolean;
}

/** One entry of sources.json. */
export interface Source {
	id: string;
	name: string;
	edition: string;
	url: string;
	license: string;
	access_date: string;
}

/** Properties of each state in the map (br_states.topojson). */
export interface StateProps {
	code: string;
	state: string;
	name: string;
}

/** Map of the states: one object "states" with one geometry per state. */
export type MapTopology = Topology<{ states: GeometryCollection<StateProps> }>;

/** One country of countries.json. Position and HDI of 2023 are null for the two countries without a ranking. */
export interface Country {
	iso3: string;
	name_pt: string;
	region: string;
	original_brics: boolean;
	series_from_1990: boolean;
	series_from_2000: boolean;
	position_2023: number | null;
	hdi_2023: number | null;
}

/** Ranking of every country in each year (ranking_years.json). Position and HDI are null when the country has no data that year. */
export interface RankingYears {
	years: number[];
	countries: { iso3: string; name: string; hdi: (number | null)[]; position: (number | null)[] }[];
}
