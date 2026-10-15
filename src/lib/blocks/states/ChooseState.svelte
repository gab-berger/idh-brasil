<script lang="ts">
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { StateRow } from '#lib/types';

	let { rows }: { rows: StateRow[] } = $props();

	// Alphabetical: the quickest way to find a small state on the map, such as DF or Sergipe.
	const options = $derived([...rows].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
</script>

<!-- A block like the questions on the Information page: a title, the control, and a line below. -->
<section class="choose" aria-labelledby="choose-title">
	<h2 id="choose-title">{t('choose.label')}</h2>
	<select
		aria-labelledby="choose-title"
		value={store.selectedCode ?? ''}
		onchange={(event) => (store.selectedCode = event.currentTarget.value || null)}
	>
		<option value="">{t('choose.none')}</option>
		{#each options as row (row.code)}
			<option value={row.code}>{row.name}</option>
		{/each}
	</select>
</section>

<style>
	/* The title and the line below follow the questions on the Information page. */
	.choose {
		padding-bottom: 12px;
		border-bottom: 1px solid var(--line);
	}

	h2 {
		margin: 0;
		padding: 10px 0;
		font-size: 1.1rem;
	}

	select {
		display: block;
		width: 100%;
		max-width: 320px;
		min-height: 44px;
		padding: 0 8px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font: inherit;
	}

	/* On a wide screen, the title and the select sit on the same line, when there is room for both. */
	@media (min-width: 960px) {
		.choose {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px 16px;
		}

		select {
			flex: 0 1 320px;
			min-width: 0;
			width: 320px;
		}
	}
</style>
