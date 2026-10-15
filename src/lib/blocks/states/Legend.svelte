<script lang="ts">
	import { num } from '#lib/format';
	import { DOMAINS, mapColor } from '#lib/scales';
	import { setColorblind, store } from '#lib/store.svelte';
	import { t } from '#lib/texts';

	// IDHM cut-offs, marked on the scale (the bands themselves are in each state's detail).
	const CUTS_IDHM: number[] = [0.5, 0.6, 0.7, 0.8];

	const domain = $derived(DOMAINS[store.measure]);
	const color = $derived(mapColor(store.measure, store.colorblind));
	const gradient = $derived.by(() => {
		const [min, max] = domain;
		const steps = Array.from({ length: 11 }, (_, i) => min + ((max - min) * i) / 10);
		return `linear-gradient(to right, ${steps.map((v) => color(v)).join(', ')})`;
	});

	function scalePosition(value: number): string {
		const [min, max] = domain;
		return `${((value - min) / (max - min)) * 100}%`;
	}
</script>

<div class="legend">
	<div class="bar" style:background={gradient} role="img" aria-label={t('legend.label')}></div>

	<div class="labels">
		<span class="end" style:left="0%">{num(domain[0])}</span>
		{#if store.measure === 'idhm'}
			{#each CUTS_IDHM as cut (cut)}
				<span class="cut" style:left={scalePosition(cut)}>{num(cut)}</span>
			{/each}
		{/if}
		<span class="end" style:left="100%">{num(domain[1])}</span>
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
