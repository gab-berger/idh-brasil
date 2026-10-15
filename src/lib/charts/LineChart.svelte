<script lang="ts">
	import { line, scaleLinear } from 'd3';
	import { axisNumber, num } from '#lib/format';
	import { t } from '#lib/texts';
	import type { ChartSeries } from '#lib/types';

	let {
		series,
		domainY,
		years,
		xLabels,
		marker,
		gapYear,
		description,
		tableCaption
	}: {
		series: ChartSeries[];
		domainY: [number, number];
		/** First and last year of the X axis. */
		years: [number, number];
		/** Years with a label on the X axis. */
		xLabels: number[];
		/** Year marked with a vertical line (the year of the map). */
		marker?: number;
		/** A year without data (change of survey): the lines stop before it and start again after it. */
		gapYear?: number;
		/** Description of the chart for screen readers. */
		description: string;
		/** Caption of the table of values, which only screen readers read. */
		tableCaption: string;
	} = $props();

	type Point = ChartSeries['points'][number];

	// The width is measured in the browser; the height follows it, within limits, so the chart does not flatten.
	let chartWidth = $state(0);
	const chartHeight = $derived(Math.round(Math.min(340, Math.max(240, chartWidth * 0.55))));
	// No labels beside the lines: the legend goes underneath, and the chart uses the full width.
	const MARGIN = { top: 12, right: 16, bottom: 28, left: 40 };

	const xScale = $derived(
		scaleLinear()
			.domain(years)
			.range([MARGIN.left, Math.max(MARGIN.left, chartWidth - MARGIN.right)])
	);
	const yScale = $derived(scaleLinear().domain(domainY).range([chartHeight - MARGIN.bottom, MARGIN.top]));
	const yTicks = $derived(yScale.ticks(5));
	const pathOf = $derived(
		line<Point>()
			.x((p) => xScale(p.year))
			.y((p) => yScale(p.value))
	);

	// Year under the pointer (mouse or finger). Without a pointer, the reading follows the timeline (the marker);
	// without a marker, it shows the last year.
	let yearFocus: number | null = $state(null);
	const readoutYear = $derived(yearFocus ?? marker ?? years[1]);

	function valueAt(item: ChartSeries, year: number): number | undefined {
		return item.points.find((p) => p.year === year)?.value;
	}

	const readout = $derived(
		series
			.flatMap((item) => {
				const value = valueAt(item, readoutYear);
				return value === undefined ? [] : [`${item.label} ${num(value)}`];
			})
			.join(' · ')
	);

	function onMove(event: PointerEvent): void {
		const { left } = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
		const year = Math.round(xScale.invert(event.clientX - left));
		yearFocus = Math.min(years[1], Math.max(years[0], year));
	}

	function onLeave(): void {
		yearFocus = null;
	}

	/** Segments of a series: before and after the gap, so the line does not cross a year without data. */
	function segmentsOf(points: Point[]): Point[][] {
		if (gapYear === undefined) return [points];
		return [points.filter((p) => p.year < gapYear), points.filter((p) => p.year > gapYear)].filter(
			(segment) => segment.length > 0
		);
	}
</script>

<figure class="chart">
	<div class="area" bind:clientWidth={chartWidth}>
		{#if chartWidth > 0}
			<svg
				width={chartWidth}
				height={chartHeight}
				role="img"
				aria-label={description}
				onpointermove={onMove}
				onpointerleave={onLeave}
			>
				{#each yTicks as value (value)}
					<line class="grid" x1={MARGIN.left} x2={chartWidth - MARGIN.right} y1={yScale(value)} y2={yScale(value)} />
					<text class="axis" x={MARGIN.left - 6} y={yScale(value)} dy="0.32em" text-anchor="end">{axisNumber(value)}</text>
				{/each}
				{#each xLabels as year (year)}
					<text class="axis" x={xScale(year)} y={chartHeight - 8} text-anchor="middle">{year}</text>
				{/each}
				{#if gapYear !== undefined}
					<line class="break" x1={xScale(gapYear)} x2={xScale(gapYear)} y1={MARGIN.top} y2={chartHeight - MARGIN.bottom} />
				{/if}
				{#if marker !== undefined}
					<line class="marker" x1={xScale(marker)} x2={xScale(marker)} y1={MARGIN.top} y2={chartHeight - MARGIN.bottom} />
				{/if}
				{#if yearFocus !== null}
					<line class="guide" x1={xScale(readoutYear)} x2={xScale(readoutYear)} y1={MARGIN.top} y2={chartHeight - MARGIN.bottom} />
				{/if}
				{#each series as item (item.key)}
					{#each segmentsOf(item.points) as segment, i (i)}
						<path
							class="line"
							d={pathOf(segment) ?? ''}
							style:stroke={item.color}
							stroke-width={item.width ?? 2}
							stroke-dasharray={item.dash}
						/>
					{/each}
				{/each}
				{#if yearFocus !== null}
					{#each series as item (item.key)}
						{@const value = valueAt(item, readoutYear)}
						{#if value !== undefined}
							<circle class="point" cx={xScale(readoutYear)} cy={yScale(value)} r="4" style:fill={item.color} />
						{/if}
					{/each}
				{/if}
			</svg>
		{/if}
	</div>

	<!-- The legend of the lines goes under the chart, and the reading of the values under it. -->
	<ul class="legend">
		{#each series as item (item.key)}
			<li>
				<svg width="22" height="8" aria-hidden="true">
					<line
						x1="1"
						x2="21"
						y1="4"
						y2="4"
						style:stroke={item.color}
						stroke-width={item.width ?? 2}
						stroke-dasharray={item.dash}
					/>
				</svg>
				{item.label}
			</li>
		{/each}
	</ul>

	<p class="readout" aria-hidden="true">{t('chart.readout', { year: readoutYear, values: readout })}</p>

	<table class="sr-only">
		<caption>{tableCaption}</caption>
		<thead>
			<tr>
				<td></td>
				{#each xLabels as year (year)}
					<th scope="col">{year}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each series as item (item.key)}
				<tr>
					<th scope="row">{item.label}</th>
					{#each xLabels as year (year)}
						{@const value = valueAt(item, year)}
						<td>{value === undefined ? '' : num(value)}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</figure>

<style>
	.chart {
		margin: 0;
	}

	.area svg {
		display: block;
		overflow: visible;
		/* A finger scrolls the page vertically; horizontally, it moves through the years. */
		touch-action: pan-y;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 16px;
		margin: 8px 0 0;
		padding: 0;
		list-style: none;
		font-size: 0.9rem;
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legend svg {
		flex: none;
	}

	.readout {
		min-height: 1.5em;
		margin: 6px 0 0;
		font-size: 0.9rem;
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
	}

	.grid {
		stroke: var(--line);
		stroke-width: 1;
	}

	.axis {
		fill: var(--text-soft);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}

	.break {
		stroke: var(--text-soft);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}

	.marker,
	.guide {
		stroke: var(--text);
		stroke-width: 1;
		opacity: 0.35;
	}

	.line {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.point {
		stroke: var(--background);
		stroke-width: 1.5;
	}
</style>
