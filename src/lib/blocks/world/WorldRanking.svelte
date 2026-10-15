<script lang="ts">
	import { onMount } from 'svelte';
	import { load } from '#lib/data';
	import { num, position } from '#lib/format';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import { rankingOfYear } from '#lib/world';
	import type { RankingYears } from '#lib/types';

	// The page draws this block in two places on a wide screen: 'start' has the title, the year and the total; 'visual' has the list.
	let { part }: { part: 'start' | 'visual' } = $props();

	// Height of each row, in px (the same as in the CSS). With it, Brazil falls in the middle of the box.
	const ROW_HEIGHT = 36;

	let data = $state.raw<RankingYears | null>(null);
	let error = $state(false);
	let box: HTMLElement | undefined = $state();

	// The data is read in the browser. The list starts at the last year of the set. The year lives in the store, because both places use it.
	onMount(() => {
		load<RankingYears>('ranking_years.json')
			.then((loaded) => {
				store.worldRankingYear ??= loaded.years[loaded.years.length - 1];
				data = loaded;
			})
			.catch(() => (error = true));
	});

	const years = $derived(data?.years ?? []);
	const year = $derived(store.worldRankingYear ?? 0);
	const rows = $derived(data && store.worldRankingYear !== null ? rankingOfYear(data, store.worldRankingYear) : []);
	const yearIndex = $derived(years.indexOf(year));
	const brazilIndex = $derived(rows.findIndex((row) => row.isBrazil));

	// When the list opens, and when the year changes, Brazil falls in the middle of the box.
	$effect(() => {
		if (!box || brazilIndex < 0) return;
		box.scrollTop = Math.max(0, brazilIndex * ROW_HEIGHT - (box.clientHeight - ROW_HEIGHT) / 2);
	});

	function step(delta: number): void {
		const next = years[yearIndex + delta];
		if (next !== undefined) store.worldRankingYear = next;
	}
</script>

{#if part === 'start'}
	{#if data && store.worldRankingYear !== null}
		<section aria-labelledby="ranking-title">
			<div class="head">
				<h2 id="ranking-title">{t('world.ranking.title', { year })}</h2>

				<div class="controls">
					<label class="year">
						<span>{t('world.ranking.year')}</span>
						<select bind:value={store.worldRankingYear}>
							{#each years as option (option)}
								<option value={option}>{option}</option>
							{/each}
						</select>
					</label>
					<div class="steps">
						<button type="button" onclick={() => step(-1)} disabled={yearIndex <= 0}>{t('time.previous')}</button>
						<button type="button" onclick={() => step(1)} disabled={yearIndex >= years.length - 1}>
							{t('time.next')}
						</button>
					</div>
				</div>
			</div>

			<p class="total">{t('world.ranking.total', { n: rows.length, year })}</p>
		</section>
	{/if}
{:else if error}
	<p role="alert">{t('error.load')}</p>
{:else if !data || store.worldRankingYear === null}
	<p>{t('loading')}</p>
{:else}
	<!-- The box scrolls, so it takes keyboard focus, for readers who do not use a mouse. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="box" bind:this={box} role="region" tabindex="0" aria-label={t('world.ranking.label', { year })}>
		<ol>
			{#each rows as row (row.iso3)}
				<li class:brazil={row.isBrazil}>
					<span class="position">{#if row.tie}<span aria-hidden="true">=</span><span class="sr-only">{t('world.ranking.tie')} </span>{/if}{position(row.position)}</span>
					<span class="name">
						{row.name}
					</span>
					<span class="value">{num(row.hdi)}</span>
				</li>
			{/each}
		</ol>
	</div>

	<p class="note">{t('world.ranking.note')}</p>
{/if}

<style>
	section {
		max-width: var(--text-width);
	}

	/* On a wide screen, the title and the year choice sit on the same line when there is room; otherwise they wrap. */
	@media (min-width: 960px) {
		.head {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: space-between;
			gap: 0 24px;
			margin: 36px 0 8px;
		}

		.head h2 {
			margin: 0;
		}

		.head .controls {
			margin: 0;
		}
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		margin: 8px 0 4px;
	}

	.year {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	select {
		min-height: 44px;
		padding: 0 8px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font: inherit;
	}

	.steps {
		display: flex;
		gap: 6px;
	}

	.steps button {
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

	.steps button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.steps button:disabled {
		color: var(--text-soft);
	}

	.total {
		margin: 4px 0 8px;
		font-size: 0.9rem;
		color: var(--text-soft);
	}

	/* Eleven rows high: the list scrolls inside the box, and Brazil stays pinned to the edge. The box is also the frame of the text for screen readers in the rows, so that text cannot stretch the page. */
	.box {
		position: relative;
		height: 396px;
		overflow-y: auto;
		overscroll-behavior: contain;
		border-top: 1px solid var(--line);
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 3.5rem minmax(0, 1fr) 4.5rem;
		align-items: center;
		box-sizing: border-box;
		height: 36px;
		padding: 0 10px;
		border-bottom: 1px solid var(--line);
		background: var(--background);
		font-variant-numeric: tabular-nums;
	}

	/* On top of the box when the list has already passed Brazil; at the bottom when it has not reached it yet. */
	li.brazil {
		position: sticky;
		top: 0;
		bottom: 0;
		z-index: 1;
		background: var(--surface);
		box-shadow: inset 4px 0 0 var(--brazil);
		font-weight: 600;
	}

	.position {
		color: var(--text-soft);
	}

	.value {
		text-align: right;
	}

	.note {
		margin: 8px 0 0;
		font-size: 0.9rem;
		color: var(--text-soft);
	}
</style>
