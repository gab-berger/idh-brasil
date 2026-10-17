<script lang="ts">
	import Chip from '#lib/Chip.svelte';
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
	<Chip label={labelOf(key)} pressed={key in store.lines} onclick={() => toggle(key)} />
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
</style>
