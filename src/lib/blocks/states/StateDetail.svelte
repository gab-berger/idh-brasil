<script lang="ts">
	import LineChart from '#lib/charts/LineChart.svelte';
	import { DIMENSION_COLORS, idhmBand } from '#lib/scales';
	import { num, position } from '#lib/format';
	import { positions } from '#lib/ranking';
	import { seriesOf } from '#lib/series';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { ChartSeries, Measure, StateRow } from '#lib/types';

	// states: the state's rows in every year (for the chart); rows: those of the timeline year (for the highlight).
	let { states, rows }: { states: StateRow[]; rows: StateRow[] } = $props();

	// The four indicators. The IDHM is the black, thicker line; the components use the dimension colors.
	const INDICATORS: Measure[] = ['idhm', 'longevity', 'education', 'income'];
	const COLOR: Record<Measure, string> = {
		idhm: 'var(--chart-ink)',
		longevity: DIMENSION_COLORS.longevity,
		education: DIMENSION_COLORS.education,
		income: DIMENSION_COLORS.income
	};
	const DOMAIN_Y: [number, number] = [0.1, 1];
	const YEAR_RANGE: [number, number] = [1991, 2024];
	const X_LABELS = [1991, 2000, 2010, 2024];

	const row = $derived(rows.find((r) => r.code === store.selectedCode));
	const positionOf = $derived(positions(rows, 'idhm'));
	const history = $derived(store.selectedCode ? seriesOf(states, 'code', store.selectedCode) : []);
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
	const highlightText = $derived(
		row
			? t('state.highlight', {
					value: num(row.idhm),
					band: t(`band.${idhmBand(row.idhm)}`),
					position: position(positionOf.get(row.code) ?? 0)
				})
			: ''
	);
</script>

{#if row}
	<section class="detail" aria-labelledby="detail-title">
		<h3 id="detail-title">{row.name}</h3>
		<p class="highlight">{highlightText}</p>
		<LineChart
			{series}
			domainY={DOMAIN_Y}
			years={YEAR_RANGE}
			xLabels={X_LABELS}
			marker={store.year}
			gapYear={2011}
			description={t('detail.chart', { name: row.name })}
			tableCaption={t('detail.table', { name: row.name })}
		/>
		<p class="source">
			{t('detail.source', { source: row.source === 'Censo' ? t('source.census') : t('source.pnad'), year: row.year })}
		</p>
	</section>
{/if}

<style>
	h3 {
		margin: 0;
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
