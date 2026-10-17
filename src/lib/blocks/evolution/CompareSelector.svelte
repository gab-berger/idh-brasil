<script lang="ts">
	import Chip from '#lib/Chip.svelte';
	import Notice from '#lib/Notice.svelte';
	import { REGION_GROUPS, regionKey, regionName } from '#lib/evolution';
	import { store, toggleCompare } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { StateRow } from '#lib/types';

	// states: the rows of the Atlas file, only for the full name of each state, which sits in the tooltip and for screen readers.
	let { states }: { states: StateRow[] } = $props();

	const names = $derived(new Map(states.map((row): [string, string] => [row.code, row.name])));
	let notice: { text: string } | null = $state(null);

	function toggle(key: string): void {
		if (!toggleCompare(key)) notice = { text: t('compare.limit') };
	}
</script>

<!-- One row for each region, in alphabetical order: the region (its average) first, then its states by name, only with the code. -->
<div class="selection" role="group" aria-label={t('evolution.selection.label')}>
	{#each REGION_GROUPS as group (group.code)}
		<div class="region" role="group" aria-label={regionName(group.code)}>
			<span class="lead">
				<Chip
					label={regionName(group.code)}
					strong
					pressed={regionKey(group.code) in store.compare}
					onclick={() => toggle(regionKey(group.code))}
				/>
			</span>
			{#each group.states as code (code)}
				<Chip
					label={code}
					name={`${names.get(code) ?? code} (${code})`}
					pressed={code in store.compare}
					onclick={() => toggle(code)}
				/>
			{/each}
		</div>
	{/each}
</div>

<Notice {notice} />

<style>
	.selection {
		display: grid;
		gap: 8px;
		margin: 12px 0 0;
	}

	.region {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	/* The region stands apart from its states by a wider gap. */
	.lead {
		margin-right: 6px;
	}
</style>
