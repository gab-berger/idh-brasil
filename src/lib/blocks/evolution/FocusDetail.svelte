<script lang="ts">
	import LineChart from '#lib/charts/LineChart.svelte';
	import { BRAZIL_KEY, focusHighlight, historyOf, nameOf } from '#lib/evolution';
	import { DIMENSION_COLORS, VALUE_DOMAIN, YEARS } from '#lib/scales';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { ChartSeries, Measure, RegionRow, StateRow } from '#lib/types';

	let { states, regions }: { states: StateRow[]; regions: RegionRow[] } = $props();

	// The four indicators. The IDHM is the black, thicker line; the components use the dimension colors.
	const INDICATORS: Measure[] = ['idhm', 'longevity', 'education', 'income'];
	const COLOR: Record<Measure, string> = {
		idhm: 'var(--chart-ink)',
		longevity: DIMENSION_COLORS.longevity,
		education: DIMENSION_COLORS.education,
		income: DIMENSION_COLORS.income
	};
	const YEAR_RANGE: [number, number] = [YEARS[0], YEARS[YEARS.length - 1]];
	const X_LABELS = [1991, 2000, 2010, 2024];

	// The place in focus: Brazil until one is chosen.
	const key = $derived(store.selectedCode ?? BRAZIL_KEY);
	const history = $derived(historyOf(key, states, regions));
	const name = $derived(nameOf(key, states, regions));
	const series = $derived(
		INDICATORS.map(
			(measure): ChartSeries => ({
				key: measure,
				label: t(`measure.${measure}`),
				color: COLOR[measure],
				width: measure === 'idhm' ? 3 : 2,
				points: history.map((r) => ({ year: r.year, value: r[measure] }))
			})
		)
	);
	const last = $derived(history.find((r) => r.year === YEAR_RANGE[1]));
</script>

{#if last}
	<section class="detail" aria-labelledby="detail-title">
		<h2 id="detail-title">{name}</h2>
		<p class="highlight">{focusHighlight(key, states, regions)}</p>
		<LineChart
			{series}
			domainY={VALUE_DOMAIN}
			years={YEAR_RANGE}
			xLabels={X_LABELS}
			gapYear={2011}
			description={t('detail.chart', { name })}
			tableCaption={t('detail.table', { name })}
		/>
		<p class="source">
			{t('detail.source', { source: last.year <= 2010 ? t('source.census') : t('source.pnad'), year: last.year })}
		</p>
	</section>
{/if}

<style>
	/* The same block as the chooser above: a title, the content, and a line below. */
	.detail {
		padding-bottom: 12px;
		border-bottom: 1px solid var(--line);
	}

	h2 {
		margin: 0;
		padding: 10px 0;
		font-size: 1.1rem;
	}

	.highlight {
		margin: 4px 0 12px;
		text-align: center;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.source {
		margin: 8px 0 0;
		font-size: 0.8rem;
		color: var(--text-soft);
	}
</style>
