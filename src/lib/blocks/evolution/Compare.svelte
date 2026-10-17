<script lang="ts">
	import Note from '#lib/Note.svelte';
	import LineChart from '#lib/charts/LineChart.svelte';
	import { compareSeries } from '#lib/evolution';
	import { VALUE_DOMAIN, YEARS } from '#lib/scales';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { RegionRow, StateRow } from '#lib/types';
	import CompareSelector from './CompareSelector.svelte';

	let { states, regions }: { states: StateRow[]; regions: RegionRow[] } = $props();

	const YEAR_RANGE: [number, number] = [YEARS[0], YEARS[YEARS.length - 1]];
	// Axis labels, without 2012: on a narrow screen it would sit on top of 2010.
	const X_LABELS = [1991, 2000, 2010, 2024];
	// There is no data for 2011: the change from the census to the PNAD Contínua shows as a gap in the lines.
	const GAP_YEAR = 2011;

	const series = $derived(compareSeries(store.compare, store.measure, states, regions));
</script>

<!-- The chart comes first, then the lines to choose: on a phone it is the first thing under the title. The measure is in the rows under the sub-tabs. -->
<section id="compare" aria-labelledby="compare-title">
	<h2 id="compare-title">{t('evolution.compare.title')}</h2>
	<LineChart
		{series}
		domainY={VALUE_DOMAIN}
		years={YEAR_RANGE}
		xLabels={X_LABELS}
		gapYear={GAP_YEAR}
		description={t('compare.chart.label', { measure: t(`measure.${store.measure}`) })}
		tableCaption={t('compare.chart.table', { measure: t(`measure.${store.measure}`) })}
	/>
	<CompareSelector {states} />
	<Note key="compare.note" />
</section>

<style>
	h2 {
		margin: 16px 0 8px;
		font-size: 1.1rem;
	}
</style>
