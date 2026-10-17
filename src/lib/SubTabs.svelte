<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';
	import { scroll } from '#lib/scroll.svelte';

	/**
	 * Sub-tabs ("Forma de ver"): block choices, fixed right under the header. The optional `extra` is a second row
	 * right under them, in the same fixed element, so the two rows always appear and disappear together.
	 */
	let {
		options,
		current,
		onChoose,
		label,
		extra
	}: {
		options: { key: T; label: string }[];
		current: T;
		onChoose: (key: T) => void;
		label: string;
		extra?: Snippet;
	} = $props();
</script>

<div class="subtabs" class:hidden={scroll.hidden}>
	<div class="row tabs" role="group" aria-label={label}>
		{#each options as option (option.key)}
			<button type="button" aria-pressed={current === option.key} onclick={() => onChoose(option.key)}>
				{option.label}
			</button>
		{/each}
	</div>
	{#if extra}
		<div class="row extra">
			{@render extra()}
		</div>
	{/if}
</div>

<style>
	/* Fixed under the header. When the page scrolls down they leave with it; when it scrolls up, they come back.
	   The rows are inside one element, so there is a single movement. With the keyboard focus inside, app.css keeps all of them on the screen. */
	.subtabs {
		position: sticky;
		top: var(--header-height);
		z-index: 8;
		margin: 0 calc(-1 * var(--gutter));
		background: var(--background);
		transition: transform 200ms ease;
	}

	.subtabs.hidden {
		transform: translateY(calc(-100% - var(--header-height)));
	}

	.row {
		display: flex;
		box-sizing: border-box;
		align-items: center;
		gap: 6px;
		padding: 8px var(--gutter);
		border-bottom: 1px solid var(--line);
	}

	.tabs {
		height: var(--tabs-height);
	}

	.extra {
		height: var(--measures-height);
	}

	.tabs button {
		flex: 1 1 auto;
		position: relative;
		min-height: 34px;
		padding: 0 8px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
	}

	/* The touch area reaches 44 px without making the button taller. */
	.tabs button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.tabs button[aria-pressed='true'] {
		border-color: var(--accent);
		background: var(--accent);
		color: var(--background);
		font-weight: 600;
	}
</style>
