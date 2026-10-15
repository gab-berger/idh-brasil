<script lang="ts">
	import { onMount } from 'svelte';
	import { load } from '#lib/data';
	import { statesOfYear, stateRow } from '#lib/series';
	import { store } from '#lib/store.svelte';
	import { summaryText } from '#lib/summary';
	import { t } from '#lib/texts';
	import type { MapTopology, StateRow } from '#lib/types';
	import RegionsView from './Regions.svelte';
	import TimeControl from './states/TimeControl.svelte';
	import ChooseState from './states/ChooseState.svelte';
	import StateDetail from './states/StateDetail.svelte';
	import Legend from './states/Legend.svelte';
	import MapView from './states/MapView.svelte';
	import StateRanking from './states/StateRanking.svelte';
	import StateSelection from './states/StateSelection.svelte';
	import MeasureSelector from './states/MeasureSelector.svelte';

	let states: StateRow[] | null = $state.raw(null);
	let topology: MapTopology | null = $state.raw(null);
	let error = $state(false);

	// The data is read only in the browser: during the build, the page comes out without it.
	onMount(() => {
		Promise.all([load<StateRow[]>('idhm_states.json'), load<MapTopology>('br_states.topojson')])
			.then(([loadedStates, map]) => {
				states = loadedStates;
				topology = map;
			})
			.catch(() => (error = true));
	});

	const rowsOfYear = $derived<StateRow[]>(states ? statesOfYear<StateRow>(states, store.year) : []);
	const brazilRow = $derived<StateRow | undefined>(states ? stateRow<StateRow>(states, 'BR', store.year) : undefined);
</script>

<div id="states">
	{#if error}
		<p role="alert">{t('error.load')}</p>
	{:else if !states || !topology}
		<p>{t('loading')}</p>
	{:else}
		{#if store.subtab !== 'state'}
			<MeasureSelector />
		{/if}

		<TimeControl />

		{#if brazilRow && store.subtab !== 'state'}
			<p class="highlight">{summaryText(brazilRow, store.measure)}</p>
		{/if}

		{#if store.subtab === 'map'}
			<div class="view view-map">
				<MapView {topology} rows={rowsOfYear} />
				<StateSelection rows={rowsOfYear} />
				<Legend />
			</div>
		{:else if store.subtab === 'ranking'}
			<div class="view view-ranking">
				<StateRanking rows={rowsOfYear} brazil={brazilRow} />
				<StateSelection rows={rowsOfYear} />
			</div>
		{:else if store.subtab === 'regions'}
			<div class="view view-regions">
				<RegionsView />
			</div>
		{:else}
			<div class="view view-state">
				<ChooseState rows={rowsOfYear} />
				{#if store.selectedCode}
					<StateDetail states={states ?? []} rows={rowsOfYear} />
				{:else}
					<p class="empty">{t('detail.empty')}</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	/* The map is at most 640 px on a computer, so it fits on the screen next to the timeline. */
	.view-map {
		max-width: 640px;
	}

	.view-ranking,
	.view-state {
		max-width: 720px;
	}

	.empty {
		color: var(--text-soft);
	}
</style>
