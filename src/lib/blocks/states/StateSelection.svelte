<script lang="ts">
	import { num } from '#lib/format';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { StateRow } from '#lib/types';

	let { rows }: { rows: StateRow[] } = $props();

	// State chosen on the map or in the ranking: the line leads to the evolution tab, where its details are.
	const row = $derived(rows.find((r) => r.code === store.selectedCode));
</script>

{#if row}
	<div class="selection">
		<p>
			{t('selection.summary', {
				name: row.name,
				measure: t(`measure.${store.measure}`),
				value: num(row[store.measure])
			})}
		</p>
		<button type="button" onclick={() => (store.subtab = 'evolution')}>{t('selection.see')}</button>
	</div>
{/if}

<style>
	.selection {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 12px;
		margin: 12px 0;
		padding: 8px 12px;
		border-left: 4px solid var(--accent);
		background: var(--surface);
	}

	.selection p {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.selection button {
		min-height: 44px;
		padding: 0 14px;
		border: 1px solid var(--accent);
		border-radius: 6px;
		background: var(--background);
		color: var(--accent);
		font: inherit;
		font-weight: 600;
	}
</style>
