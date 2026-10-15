<script lang="ts">
	import { onDestroy } from 'svelte';
	import { YEARS } from '#lib/scales';
	import { goToYear, store } from '#lib/store.svelte';
	import { t } from '#lib/texts';

	const STEP_MS = 800;
	const LAST = YEARS.length - 1;

	// One year every STEP_MS. If it is already at the last year, it starts again from the first one, and it stops at the last one.
	$effect(() => {
		if (!store.playing) return;
		const id = setInterval(() => {
			const index = YEARS.indexOf(store.year);
			if (index >= LAST) {
				store.playing = false;
				return;
			}
			goToYear(YEARS[index + 1]);
		}, STEP_MS);
		return () => clearInterval(id);
	});

	// When the tab changes, the animation stops; it does not start playing again by itself.
	onDestroy(() => {
		store.playing = false;
	});

	function togglePlay(): void {
		if (store.playing) {
			store.playing = false;
			return;
		}
		if (store.year === YEARS[LAST]) goToYear(YEARS[0]);
		store.playing = true;
	}
</script>

<svelte:document
	onvisibilitychange={() => {
		if (document.hidden) store.playing = false;
	}}
/>

<button
	type="button"
	class="play"
	aria-pressed={store.playing}
	aria-label={store.playing ? t('time.pause') : t('time.play')}
	title={store.playing ? t('time.pause') : t('time.play')}
	onclick={togglePlay}
>
	<span aria-hidden="true">{store.playing ? '❚❚' : '▶'}</span>
</button>

<style>
	/* Small round button: the drawing is 44 px, and so is the touch area. */
	.play {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 1px solid var(--accent);
		border-radius: 50%;
		background: var(--background);
		color: var(--accent);
		font-size: 0.8rem;
		cursor: pointer;
	}

	.play[aria-pressed='true'] {
		border-color: var(--text);
		color: var(--text);
	}
</style>
