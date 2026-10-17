<script lang="ts">
	import { MEASURES } from '#lib/scales';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
</script>

<div class="selector" role="group" aria-label={t('measure.label')}>
	{#each MEASURES as measure (measure)}
		<button type="button" aria-pressed={store.measure === measure} onclick={() => (store.measure = measure)}>
			{t(`measure.${measure}`)}
		</button>
	{/each}
</div>

<style>
	/* Second row under the sub-tabs, with the same design: the chosen one is a whole blue block. */
	.selector {
		display: flex;
		flex: 1 1 auto;
		gap: 6px;
	}

	button {
		flex: 1 1 auto;
		position: relative;
		min-height: 34px;
		padding: 0 6px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font: inherit;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	button[aria-pressed='true'] {
		border-color: var(--accent);
		background: var(--accent);
		color: var(--background);
		font-weight: 600;
	}
</style>
