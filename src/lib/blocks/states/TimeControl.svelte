<script lang="ts">
	import { percentOfYear, nearestIndex } from '#lib/time';
	import { YEARS } from '#lib/scales';
	import { goToYear, store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import PlayButton from './PlayButton.svelte';

	const LAST = YEARS.length - 1;
	const index = $derived(YEARS.indexOf(store.year));
	const KEY_STEPS: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };

	// Labels on the ruler: the side says in which direction the text grows from the tick mark.
	const LABELS: { year: number; side: 'left' | 'center' | 'right' }[] = [
		{ year: 1991, side: 'left' },
		{ year: 2000, side: 'center' },
		{ year: 2010, side: 'right' },
		{ year: 2012, side: 'left' },
		{ year: 2024, side: 'right' }
	];
	// Gaps between the censuses: 9 years (1991-2000) and 10 years (2000-2010).
	const GAPS: { from: number; to: number }[] = [
		{ from: 1991, to: 2000 },
		{ from: 2000, to: 2010 }
	];

	let track: HTMLElement | undefined = $state();
	let dragging = false;

	const sourceOf = (year: number): string => (year <= 2010 ? t('source.census') : t('source.pnad'));

	function step(delta: number): void {
		goToYear(YEARS[Math.min(LAST, Math.max(0, index + delta))]);
	}

	function goToPoint(clientX: number): void {
		if (!track) return;
		const { left, width } = track.getBoundingClientRect();
		const fraction = Math.min(1, Math.max(0, (clientX - left) / width));
		const next = YEARS[nearestIndex(fraction)];
		if (next !== store.year) goToYear(next);
	}

	function onPointerDown(event: PointerEvent): void {
		store.playing = false;
		dragging = true;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		goToPoint(event.clientX);
	}

	function onPointerMove(event: PointerEvent): void {
		if (dragging) goToPoint(event.clientX);
	}

	function onPointerUp(): void {
		dragging = false;
	}

	function onKeyDown(event: KeyboardEvent): void {
		const delta = KEY_STEPS[event.key];
		if (delta) {
			event.preventDefault();
			store.playing = false;
			step(delta);
		} else if (event.key === 'Home') {
			store.playing = false;
			goToYear(YEARS[0]);
		} else if (event.key === 'End') {
			store.playing = false;
			goToYear(YEARS[LAST]);
		}
	}
</script>

<div class="time">
	<div class="controls">
		<button type="button" onclick={() => step(-1)} disabled={store.playing || index === 0}>
			{t('time.previous')}
		</button>
		<div class="center">
			<p class="year" aria-hidden="true">{store.year}</p>
			<PlayButton />
		</div>
		<button type="button" onclick={() => step(1)} disabled={store.playing || index === LAST}>
			{t('time.next')}
		</button>
	</div>

	<div class="ruler">
		<div
			class="track"
			role="slider"
			tabindex="0"
			aria-label={t('time.label')}
			aria-valuemin={0}
			aria-valuemax={LAST}
			aria-valuenow={index}
			aria-valuetext={t('time.valuetext', { year: store.year, source: sourceOf(store.year) })}
			bind:this={track}
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onkeydown={onKeyDown}
		>
			<div class="line"></div>
			{#each YEARS as year (year)}
				<span class="tick" style:left={`${percentOfYear(year)}%`}></span>
			{/each}
			<!-- Change of survey: between 2010 (census) and 2012 (PNAD Contínua), there is no 2011. -->
			<span class="break" style:left={`${percentOfYear(2011)}%`}></span>
			<span class="thumb" style:left={`${percentOfYear(store.year)}%`}></span>
		</div>

		<div class="labels" aria-hidden="true">
			{#each LABELS as label (label.year)}
				<span
					style:left={`${percentOfYear(label.year)}%`}
					class:left={label.side === 'left'}
					class:center={label.side === 'center'}
					class:right={label.side === 'right'}>{label.year}</span
				>
			{/each}
		</div>

		<div class="gaps" aria-hidden="true">
			{#each GAPS as gap (gap.from)}
				<span style:left={`${(percentOfYear(gap.from) + percentOfYear(gap.to)) / 2}%`}>
					{t('time.years', { n: gap.to - gap.from })}
				</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.time {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 0 0 12px;
	}

	/* Previous and next at the ends; the year and the play button in the middle. */
	.controls {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 6px;
	}

	/* Low buttons: the drawing is 34 px, and the touch area (below) reaches 44 px. */
	.controls > button {
		position: relative;
		min-height: 34px;
		padding: 0 4px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font: inherit;
		font-size: 0.85rem;
	}

	.controls > button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.controls > button:disabled {
		color: var(--text-soft);
		opacity: 0.6;
	}

	.center {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.year {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	/* Room for the thumb so it is not cut at the ends (half of it goes past the track). */
	.ruler {
		padding: 0 16px;
	}

	/* A 44 px area to drag; touch-action keeps the page from scrolling along. */
	.track {
		position: relative;
		height: 44px;
		touch-action: none;
		cursor: pointer;
	}

	.line {
		position: absolute;
		top: 50%;
		right: 0;
		left: 0;
		height: 4px;
		margin-top: -2px;
		border-radius: 2px;
		background: var(--line);
	}

	.tick {
		position: absolute;
		top: 50%;
		width: 2px;
		height: 8px;
		margin-top: -4px;
		background: var(--text-soft);
		transform: translateX(-50%);
	}

	.break {
		position: absolute;
		top: 50%;
		width: 2px;
		height: 20px;
		margin-top: -10px;
		background: var(--text);
		transform: translateX(-50%);
		box-shadow: 4px 0 0 var(--text);
	}

	/* A discreet indicator: a small circle, with a blue outline and a white centre. */
	.thumb {
		position: absolute;
		top: 50%;
		width: 14px;
		height: 14px;
		margin: -7px 0 0 -7px;
		border: 2px solid var(--accent);
		border-radius: 50%;
		background: var(--background);
	}

	.track:focus-visible .thumb {
		outline: 3px solid var(--accent);
		outline-offset: 2px;
	}

	.labels,
	.gaps {
		position: relative;
		height: 1.25rem;
		font-size: 0.8rem;
		color: var(--text-soft);
	}

	.labels span,
	.gaps span {
		position: absolute;
		top: 0;
		white-space: nowrap;
	}

	.labels .left {
		transform: none;
	}

	.labels .center,
	.gaps span {
		transform: translateX(-50%);
	}

	.labels .right {
		transform: translateX(-100%);
	}
</style>
