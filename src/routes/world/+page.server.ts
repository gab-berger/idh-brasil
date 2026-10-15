import { readData } from '#lib/data.server';
import type { AverageRow, Country, CountryRow } from '#lib/types';
import { highlightOfBrazil, worldAnalyses } from '#lib/world';
import type { PageServerLoad } from './$types';

// Computed at build time: the highlight and the analyses of the evolution come out in the HTML, without JavaScript.
export const load: PageServerLoad = () => {
	const countries = readData<Country[]>('countries.json');
	const countryRows = readData<CountryRow[]>('hdi_countries.json');
	const averages = readData<AverageRow[]>('averages.json');
	return {
		highlight: highlightOfBrazil(countries),
		analyses: worldAnalyses(countryRows, averages)
	};
};
