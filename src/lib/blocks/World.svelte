<script lang="ts">
	import { onMount } from 'svelte';
	import { load } from '#lib/data';
	import LineChart from '#lib/charts/LineChart.svelte';
	import { BRAZIL_COLOR } from '#lib/scales';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import { labelOf, lineStyleOf, pointsOf } from '#lib/world';
	import type { AverageRow, ChartSeries, CountryRow, LineStyle } from '#lib/types';
	import LineSelector from './world/LineSelector.svelte';

	const DASH: Record<LineStyle, string | undefined> = { solid: undefined, dashed: '8 5', dotted: '2 4' };
	const DOMAIN_Y: [number, number] = [0.4, 0.95];
	const YEAR_RANGE: [number, number] = [1990, 2023];

	let countries: CountryRow[] | null = $state.raw(null);
	let averages: AverageRow[] | null = $state.raw(null);
	let error = $state(false);

	// The data is read only in the browser: during the build, the page comes out with the text of the tab, without the chart.
	onMount(() => {
		Promise.all([load<CountryRow[]>('hdi_countries.json'), load<AverageRow[]>('averages.json')])
			.then(([loadedCountries, loadedAverages]) => {
				countries = loadedCountries;
				averages = loadedAverages;
			})
			.catch(() => (error = true));
	});

	// Brazil is always there, thick and continuous; the other lines follow the order in which they were turned on.
	const series = $derived.by((): ChartSeries[] => {
		const loadedCountries = countries;
		const loadedAverages = averages;
		if (!loadedCountries || !loadedAverages) return [];
		const brazil: ChartSeries = {
			key: 'BRA',
			label: labelOf('BRA'),
			color: BRAZIL_COLOR,
			width: 3,
			points: pointsOf('BRA', loadedCountries, loadedAverages)
		};
		const linked = Object.entries(store.lines).map(
			([key, color], index): ChartSeries => ({
				key,
				label: labelOf(key),
				color,
				dash: DASH[lineStyleOf(key, index)],
				points: pointsOf(key, loadedCountries, loadedAverages)
			})
		);
		return [brazil, ...linked];
	});
</script>

<section id="compare" class="compare" aria-labelledby="compare-title">
	<h2 id="compare-title">{t('world.title')}</h2>
	{#if error}
		<p role="alert">{t('error.load')}</p>
	{:else if series.length === 0}
		<p>{t('loading')}</p>
	{:else}
		<LineSelector />
		<LineChart
			{series}
			domainY={DOMAIN_Y}
			years={YEAR_RANGE}
			xLabels={[1990, 2000, 2010, 2023]}
			description={t('world.chart.label')}
			tableCaption={t('world.chart.table')}
		/>
	{/if}
</section>

<style>
	h2 {
		margin: 16px 0 8px;
	}
</style>
