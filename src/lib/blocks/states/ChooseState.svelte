<script lang="ts">
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { StateRow } from '#lib/types';

	let { rows }: { rows: StateRow[] } = $props();

	// Alphabetical: the quickest way to find a small state on the map, such as DF or Sergipe.
	const options = $derived([...rows].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
</script>

<label class="choose">
	<span>{t('choose.label')}</span>
	<select
		value={store.selectedCode ?? ''}
		onchange={(event) => (store.selectedCode = event.currentTarget.value || null)}
	>
		<option value="">{t('choose.none')}</option>
		{#each options as row (row.code)}
			<option value={row.code}>{row.name}</option>
		{/each}
	</select>
</label>

<style>
	.choose {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 12px;
		margin: 8px 0;
	}

	select {
		flex: 1 1 200px;
		max-width: 320px;
		min-height: 44px;
		padding: 0 8px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font: inherit;
	}
</style>
