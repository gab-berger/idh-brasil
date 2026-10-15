<script lang="ts">
	import { onMount } from 'svelte';
	import { goToView } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { Analysis } from '#lib/types';

	let { items, title = t('analysis.title') }: { items: Analysis[]; title?: string } = $props();

	// One analysis at a time, rotating on its own. It stops when the mouse or the focus is inside, and when the
	// reader pauses it. It does not rotate for readers who asked for less motion in the system (WCAG 2.2.2).
	const INTERVAL_MS = 10000;

	let current = $state(0);
	let paused = $state(false);
	let inside = $state(false);
	let mounted = $state(false);
	let noMotion = $state(false);

	onMount(() => {
		mounted = true;
		noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const rotating = $derived(mounted && !paused && !inside && !noMotion && items.length > 1);

	$effect(() => {
		if (!rotating) return;
		const id = setInterval(() => (current = (current + 1) % items.length), INTERVAL_MS);
		return () => clearInterval(id);
	});

	function step(delta: number): void {
		current = (current + delta + items.length) % items.length;
	}

	/** Takes the map (or the regions chart) to the view of the analysis, and scrolls there. */
	function show(item: Analysis): void {
		if (!item.action) return;
		goToView(item.action);
		const target = 'states';
		document.getElementById(target)?.scrollIntoView({ behavior: noMotion ? 'auto' : 'smooth' });
	}

	function leaveFocus(event: FocusEvent): void {
		const box = event.currentTarget as HTMLElement;
		if (!box.contains(event.relatedTarget as Node | null)) inside = false;
	}
</script>

<section
	class="analysis"
	aria-labelledby="analysis-title"
	aria-roledescription="carrossel"
	onpointerenter={() => (inside = true)}
	onpointerleave={() => (inside = false)}
	onfocusin={() => (inside = true)}
	onfocusout={leaveFocus}
>
	<h2 id="analysis-title">{title}</h2>

	<!-- Without JavaScript, the analyses appear one under the other; the controls exist only after mounting. -->
	{#if mounted && items.length > 1}
		<div class="controls">
			{#if !noMotion}
				<button type="button" aria-pressed={paused} onclick={() => (paused = !paused)}>
					{paused ? t('analysis.resume') : t('analysis.pause')}
				</button>
			{/if}
			<button type="button" onclick={() => step(-1)}>{t('analysis.previous')}</button>
			<span class="position" aria-hidden="true">{t('analysis.position', { n: current + 1, total: items.length })}</span>
			<button type="button" onclick={() => step(1)}>{t('analysis.next')}</button>
		</div>
	{/if}

	<div class="items" aria-live={rotating ? 'off' : 'polite'}>
		{#each items as item, i (item.id)}
			<div
				class="item"
				role="group"
				aria-roledescription="slide"
				aria-label={t('analysis.position', { n: i + 1, total: items.length })}
				hidden={mounted && i !== current}
			>
				<h3>{item.title}</h3>
				{#each item.text.split('\n') as paragraph}
					<p>{paragraph}</p>
				{/each}
				{#if mounted && item.action}
					<button type="button" class="see" onclick={() => show(item)}>{item.action.label}</button>
				{/if}
			</div>
		{/each}
	</div>
</section>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-bottom: 12px;
	}

	.controls button {
		position: relative;
		min-height: 34px;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font: inherit;
		font-size: 0.9rem;
	}

	.controls button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.position {
		min-width: 3.5rem;
		color: var(--text-soft);
		font-size: 0.9rem;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}

	.item {
		max-width: var(--text-width);
		padding: 4px 0 4px 16px;
		border-left: 4px solid var(--accent);
	}

	.item + .item {
		margin-top: 16px;
	}

	h3 {
		margin: 0 0 6px;
		font-size: 1.1rem;
	}

	.item p {
		margin: 0;
	}

	.see::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.see {
		margin-top: 10px;
		position: relative;
		min-height: 34px;
		padding: 0 14px;
		border: 1px solid var(--accent);
		border-radius: 6px;
		background: var(--background);
		color: var(--accent);
		font: inherit;
		font-weight: 600;
	}
</style>
