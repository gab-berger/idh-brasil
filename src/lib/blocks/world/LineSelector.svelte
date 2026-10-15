<script lang="ts">
	import Notice from '#lib/Notice.svelte';
	import { toggleLine, store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import { COUNTRIES, GROUPS, labelOf } from '#lib/world';

	let notice: { text: string } | null = $state(null);

	function toggle(key: string): void {
		if (!toggleLine(key)) notice = { text: t('compare.limit') };
	}
</script>

{#snippet chip(key: string)}
	<button type="button" class="chip" aria-pressed={key in store.lines} onclick={() => toggle(key)}>
		{labelOf(key)}
	</button>
{/snippet}

<div class="selection" role="group" aria-label={t('world.selection.label')}>
	<div class="group">
		<h3>{t('world.selection.averages')}</h3>
		<div class="chips">
			{#each GROUPS as key (key)}
				{@render chip(key)}
			{/each}
		</div>
	</div>
	<div class="group">
		<h3>{t('world.selection.countries')}</h3>
		<div class="chips">
			{#each COUNTRIES as key (key)}
				{@render chip(key)}
			{/each}
		</div>
	</div>
</div>

<Notice {notice} />

<style>
	.selection {
		display: grid;
		gap: 8px;
		margin-bottom: 8px;
	}

	.group {
		display: grid;
		gap: 6px;
	}

	h3 {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-soft);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	/* Same design as the sub-tabs and the measures: the chosen one is a blue block. The color of each line is at its end, in the chart. */
	.chip {
		position: relative;
		min-height: 34px;
		padding: 0 10px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font: inherit;
		font-size: 0.875rem;
	}

	.chip::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.chip[aria-pressed='true'] {
		border-color: var(--accent);
		background: var(--accent);
		color: var(--background);
		font-weight: 600;
	}
</style>
