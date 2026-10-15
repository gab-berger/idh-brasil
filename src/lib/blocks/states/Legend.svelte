<script lang="ts">
	import { num } from '#lib/format';
	import { mapColor, VALUE_DOMAIN } from '#lib/scales';
	import { setColorblind, store } from '#lib/store.svelte';
	import { t } from '#lib/texts';

	// The scale is the same for every measure, so its ends and its labels are the same too.
	const [min, max] = VALUE_DOMAIN;
	const LABELS: number[] = [0.4, 0.6, 0.8];
	// IDHM cut-offs: drawn as short marks without a label, so the labels stay readable on a phone.
	const CUTS_IDHM: number[] = [0.5, 0.6, 0.7, 0.8];

	const color = $derived(mapColor(store.colorblind));
	const gradient = $derived.by(() => {
		const steps = Array.from({ length: 11 }, (_, i) => min + ((max - min) * i) / 10);
		return `linear-gradient(to right, ${steps.map((v) => color(v)).join(', ')})`;
	});

	const marks = $derived(store.measure === 'idhm' ? CUTS_IDHM : []);

	function scalePosition(value: number): string {
		return `${((value - min) / (max - min)) * 100}%`;
	}
</script>

<div class="legend">
	<div class="bar" style:background={gradient} role="img" aria-label={t('legend.label')}></div>

	<div class="labels">
		<span class="end" style:left="0%">{num(min)}</span>
		{#each LABELS as label (label)}
			<span style:left={scalePosition(label)}>{num(label)}</span>
		{/each}
		{#each marks as mark (mark)}
			<span class="mark" style:left={scalePosition(mark)} aria-hidden="true"></span>
		{/each}
		<span class="end" style:left="100%">{num(max)}</span>
	</div>

	<!-- A discreet option, next to the scale it changes. -->
	<button
		type="button"
		class="colorblind"
		aria-pressed={store.colorblind}
		onclick={() => setColorblind(!store.colorblind)}
	>
		{t('palette.colorblind')}
	</button>
</div>

<style>
	.legend {
		margin: 12px 0 4px;
		padding: 0 4px;
	}

	.bar {
		height: 14px;
		border-radius: 4px;
	}

	.labels {
		position: relative;
		height: 1.5rem;
		margin-top: 4px;
		font-size: 0.8rem;
		color: var(--text-soft);
	}

	.labels span {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.labels .end:first-child {
		transform: none;
	}

	.labels .end:last-child {
		transform: translateX(-100%);
	}

	/* A short line hanging from the bar, where a band starts. */
	.labels .mark {
		top: -6px;
		width: 1px;
		height: 6px;
		background: var(--text-soft);
	}

	.colorblind {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--text-soft);
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
	}

	/* A drawn checkbox: empty when the option is off, filled when it is on. */
	.colorblind::before {
		content: '';
		box-sizing: border-box;
		width: 14px;
		height: 14px;
		border: 1.5px solid var(--text-soft);
		border-radius: 3px;
	}

	.colorblind[aria-pressed='true']::before {
		border-color: var(--accent);
		background: var(--accent);
		box-shadow: inset 0 0 0 2px var(--background);
	}
</style>
