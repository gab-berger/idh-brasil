<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scroll } from '#lib/scroll.svelte';

	// head: the title, above everything. start: the text and the controls. visual: the map, the chart or the list. end: what comes after them.
	// visualFirst: on a narrow screen the visual comes before the start, so the chart is the first thing under the title.
	let {
		id,
		head,
		start,
		visual,
		end,
		visualFirst = false
	}: { id?: string; head?: Snippet; start: Snippet; visual: Snippet; end?: Snippet; visualFirst?: boolean } = $props();
</script>

{#snippet startBox()}
	<div class="start">
		{@render start()}
	</div>
{/snippet}

{#snippet visualBox()}
	<div class="visual">
		{@render visual()}
	</div>
{/snippet}

<div {id} class="split" class:hidden={scroll.hidden}>
	{#if head}
		<div class="head">
			{@render head()}
		</div>
	{/if}
	<!-- The order in the page is the reading order, so a screen reader and the Tab key follow what the eye sees on a phone. -->
	{#if visualFirst}
		{@render visualBox()}
		{@render startBox()}
	{:else}
		{@render startBox()}
		{@render visualBox()}
	{/if}
	{#if end}
		<div class="end">
			{@render end()}
		</div>
	{/if}
</div>

<style>
	/* On a narrow screen: one column, in the order head, start, visual, end (or head, visual, start, end). */
	.visual {
		max-width: 720px;
		margin: 0 auto;
	}

	/* From 1024 px: two halves. The title, the text and the controls stay on the left; the visual is on the right, under the sub-tabs, and stays on the screen while the left one scrolls. */
	@media (min-width: 1024px) {
		.split {
			--visual-height: calc(100vh - var(--header-height) - var(--bars-height) - 32px);
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			grid-template-rows: auto auto 1fr;
			column-gap: 32px;
			align-items: start;
		}

		.head {
			grid-column: 1;
			grid-row: 1;
		}

		.start {
			grid-column: 1;
			grid-row: 2;
		}

		.visual {
			grid-column: 2;
			grid-row: 1 / span 3;
			position: sticky;
			top: calc(var(--header-height) + var(--bars-height));
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
			grid-row: 3;
		}
	}
</style>
