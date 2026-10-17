<script lang="ts">
	/** A button that turns a chart line on or off. The color of the line is at its end, in the chart. */
	let {
		label,
		pressed,
		name,
		strong = false,
		onclick
	}: {
		label: string;
		pressed: boolean;
		/** Full name for screen readers and for the tooltip, when the label is short (a state code). It must contain the label. */
		name?: string;
		/** Bold, so a group (a region) stands out from the single items (its states). */
		strong?: boolean;
		onclick: () => void;
	} = $props();
</script>

<button type="button" class="chip" class:strong aria-pressed={pressed} aria-label={name} title={name} {onclick}>{label}</button>

<style>
	/* Same design as the sub-tabs and the measures: the chosen one is a blue block. */
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

	.chip.strong,
	.chip.strong[aria-pressed='true'] {
		font-weight: 700;
	}
</style>
