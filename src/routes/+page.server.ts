import { brazilAnalyses } from '#lib/analysis';
import { readData } from '#lib/data.server';
import type { RegionRow, StateRow } from '#lib/types';
import type { PageServerLoad } from './$types';

// Computed at build time: the analyses come out ready in the HTML, without depending on JavaScript.
export const load: PageServerLoad = () => {
	const states = readData<StateRow[]>('idhm_states.json');
	const regions = readData<RegionRow[]>('regions.json');
	return { analyses: brazilAnalyses(states, regions) };
};
