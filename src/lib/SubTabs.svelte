<script lang="ts" generics="T extends string">
	import { scroll } from '#lib/scroll.svelte';

	/** Sub-tabs ("Forma de ver"): block choices, fixed right under the header. */
	let {
		options,
		current,
		onChoose,
		label
	}: {
		options: { key: T; label: string }[];
		current: T;
		onChoose: (key: T) => void;
		label: string;
	} = $props();
</script>

<div class="subtabs" class:hidden={scroll.hidden} role="group" aria-label={label}>
	{#each options as option (option.key)}
		<button type="button" aria-pressed={current === option.key} onclick={() => onChoose(option.key)}>
			{option.label}
		</button>
	{/each}
</div>

<style>
	/* Fixed under the header. When the page scrolls down they leave with it; when it scrolls up, they come back. */
	.subtabs {
		position: sticky;
		top: var(--header-height);
		z-index: 8;
		display: flex;
		box-sizing: border-box;
		align-items: center;
		gap: 6px;
		height: var(--tabs-height);
		margin: 0 calc(-1 * var(--gutter));
		padding: 8px var(--gutter);
		border-bottom: 1px solid var(--line);
		background: var(--background);
		transition: transform 200ms ease;
	}

	.subtabs.hidden {
		transform: translateY(calc(-100% - var(--header-height)));
	}

	.subtabs.hidden:focus-within {
		transform: none;
	}

	.subtabs button {
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
	.subtabs button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.subtabs button[aria-pressed='true'] {
		border-color: var(--accent);
		background: var(--accent);
		color: var(--background);
		font-weight: 600;
	}
</style>
