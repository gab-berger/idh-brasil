<script lang="ts">
	import { onMount } from 'svelte';
	import Note from '#lib/Note.svelte';
	import LineChart from '#lib/charts/LineChart.svelte';
	import { load } from '#lib/data';
	import { BRAZIL_COLOR, REGION_COLORS, REGIONS, VALUE_DOMAIN, YEARS } from '#lib/scales';
	import { seriesOf } from '#lib/series';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { ChartSeries, RegionRow, StateRow } from '#lib/types';

	const FIRST = YEARS[0];
	const LAST = YEARS[YEARS.length - 1];
	// Axis labels, without 2012: on a narrow screen it would sit on top of 2010.
	const X_LABELS = [1991, 2000, 2010, 2024];
	// There is no data for 2011: the change from the census to the PNAD Contínua shows as a gap in the lines.
	const GAP_YEAR = 2011;

	let regionRows: RegionRow[] | null = $state.raw(null);
	let stateRows: StateRow[] | null = $state.raw(null);
	let error = $state(false);

	onMount(() => {
		Promise.all([load<RegionRow[]>('regions.json'), load<StateRow[]>('idhm_states.json')])
			.then(([loadedRegions, loadedStates]) => {
				regionRows = loadedRegions;
				stateRows = loadedStates;
			})
			.catch(() => (error = true));
	});

	const series = $derived.by((): ChartSeries[] => {
		const regions = regionRows;
		const states = stateRows;
		if (!regions || !states) return [];
		const measure = store.measure;
		const regionSeries = REGIONS.map((code): ChartSeries => {
			const rows = seriesOf(regions, 'region', code);
			return {
				key: code,
				label: rows[0]?.name ?? code,
				color: REGION_COLORS[code].color,
				dash: REGION_COLORS[code].dash,
				points: rows.map((r) => ({ year: r.year, value: r[measure] }))
			};
		});
		const brazil: ChartSeries = {
			key: 'BR',
			label: t('general.brazil'),
			color: BRAZIL_COLOR,
			width: 3,
			points: seriesOf(states, 'code', 'BR').map((r) => ({ year: r.year, value: r[measure] }))
		};
		return [...regionSeries, brazil];
	});
</script>

<section aria-labelledby="regions-title">
	<h3 id="regions-title">{t('regions.title')}</h3>
	{#if error}
		<p role="alert">{t('error.load')}</p>
	{:else if series.length === 0}
		<p>{t('loading')}</p>
	{:else}
		<LineChart
			{series}
			domainY={VALUE_DOMAIN}
			years={[FIRST, LAST]}
			xLabels={X_LABELS}
			marker={store.year}
			gapYear={GAP_YEAR}
			description={t('regions.label', { measure: t(`measure.${store.measure}`) })}
			tableCaption={t('regions.table', { measure: t(`measure.${store.measure}`) })}
		/>
	{/if}
	<Note key="regions.note" />
</section>
