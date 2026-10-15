<script lang="ts">
	import { num, position } from '#lib/format';
	import { positions } from '#lib/ranking';
	import { mapColor, positionInDomain, VALUE_DOMAIN } from '#lib/scales';
	import { store, toggleState } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { StateRow } from '#lib/types';

	let { rows, brazil }: { rows: StateRow[]; brazil?: StateRow } = $props();

	// Bars on the scale shared by every metric and by the map: the same length is the same value in each metric.
	const domain = VALUE_DOMAIN;
	const color = $derived(mapColor(store.colorblind));
	const positionOf = $derived(positions(rows, store.measure));
	const sorted = $derived([...rows].sort((a, b) => b[store.measure] - a[store.measure]));
	const brazilValue = $derived(brazil?.[store.measure]);

	function fraction(value: number): number {
		return positionInDomain(value, domain);
	}
</script>

<div class="axis" aria-hidden="true">
	<span></span>
	<span></span>
	<span class="axis-range"><span>{num(domain[0])}</span><span>{num(domain[1])}</span></span>
	<span></span>
</div>

<div class="list">
	<ol aria-label={t('ranking.label', { measure: t(`measure.${store.measure}`), year: store.year })}>
		{#each sorted as row (row.code)}
			{@const value = row[store.measure]}
			<li>
				<button type="button" aria-pressed={store.selectedCode === row.code} onclick={() => toggleState(row.code)}>
					<span class="position">{position(positionOf.get(row.code) ?? 0)}</span>
					<span class="name">{row.name}</span>
					<span class="bar"><span style:width={`${fraction(value) * 100}%`} style:background={color(value)}></span></span>
					<span class="value">{num(value)}</span>
				</button>
			</li>
		{/each}
	</ol>

	<!-- Same columns as the rows above (position and name on the left, value on the right): the line falls exactly on Brazil's value. -->
	{#if brazilValue !== undefined}
		<span class="reference" style:left={`calc(9.5rem + (100% - 13.5rem) * ${fraction(brazilValue)})`} aria-hidden="true"></span>
	{/if}
</div>
{#if brazilValue !== undefined}
	<p class="legend-note">{t('ranking.brazil', { value: num(brazilValue) })}</p>
{/if}

<style>
	/* Same columns as the list, so the ends of the axis fall on the ends of the bar. */
	.axis {
		display: grid;
		grid-template-columns: 2.5rem 7rem minmax(0, 1fr) 4rem;
		margin-bottom: 4px;
		font-size: 0.75rem;
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
	}

	.axis-range {
		display: flex;
		justify-content: space-between;
	}

	.list {
		position: relative;
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	button {
		display: grid;
		grid-template-columns: 2.5rem 7rem minmax(0, 1fr) 4rem;
		align-items: center;
		width: 100%;
		min-height: 44px;
		padding: 0;
		border: 0;
		border-bottom: 1px solid var(--line);
		background: transparent;
		color: var(--text);
		font: inherit;
		text-align: left;
	}

	button[aria-pressed='true'] {
		background: var(--surface);
		font-weight: 600;
	}

	.position {
		color: var(--text-soft);
		font-variant-numeric: tabular-nums;
	}

	.name {
		padding-right: 8px;
		font-size: 0.9rem;
		line-height: 1.2;
	}

	.bar {
		display: block;
		height: 14px;
		overflow: hidden;
		border-radius: 3px;
		background: var(--surface);
	}

	.bar > span {
		display: block;
		height: 100%;
	}

	.value {
		padding-left: 8px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.reference {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--brazil);
		pointer-events: none;
	}

	.legend-note {
		margin: 8px 0 0;
		font-size: 0.9rem;
		color: var(--text-soft);
	}

	/* With a mouse, on a computer, lower rows: the ranking fits next to the map. On touch, 44 px. */
	@media (min-width: 960px) and (pointer: fine) {
		button {
			min-height: 28px;
		}

		.name {
			font-size: 0.85rem;
		}
	}
</style>
