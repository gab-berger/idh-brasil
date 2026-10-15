<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scroll } from '#lib/scroll.svelte';

	// start: the text and the controls. visual: the map, the chart or the list. end: what comes after them.
	let { id, start, visual, end }: { id?: string; start: Snippet; visual: Snippet; end?: Snippet } = $props();
</script>

<div {id} class="split" class:hidden={scroll.hidden}>
	<div class="start">
		{@render start()}
	</div>
	<div class="visual">
		{@render visual()}
	</div>
	{#if end}
		<div class="end">
			{@render end()}
		</div>
	{/if}
</div>

<style>
	/* On a narrow screen: one column, in the order start, visual, end. */
	.visual {
		max-width: 720px;
		margin: 0 auto;
	}

	/* From 1024 px: two halves. The text and the controls stay on the left; the visual is on the right, under the sub-tabs, and stays on the screen while the left one scrolls. */
	@media (min-width: 1024px) {
		.split {
			--visual-height: calc(100vh - var(--header-height) - var(--tabs-height) - 32px);
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			grid-template-rows: auto 1fr;
			column-gap: 32px;
			align-items: start;
		}

		.start {
			grid-column: 1;
			grid-row: 1;
		}

		.visual {
			grid-column: 2;
			grid-row: 1 / span 2;
			position: sticky;
			top: calc(var(--header-height) + var(--tabs-height));
			height: var(--visual-height);
			max-width: none;
			margin: 0;
			overflow-y: auto;
			transition: top 200ms ease;
		}

		/* When the sub-tabs hide with the scroll, the visual moves up with them. */
		.split.hidden .visual {
			top: 8px;
		}

		.end {
			grid-column: 1;
			grid-row: 2;
		}
	}
</style>
