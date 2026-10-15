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

	// The page draws this block in two places on a wide screen: 'start' has the text and the controls, 'visual' has the map, the list or the chart.
	let { part }: { part: 'start' | 'visual' } = $props();

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

{#if part === 'start'}
	{#if states && topology}
		{#if store.subtab !== 'state'}
			<MeasureSelector />
		{/if}

		<TimeControl />

		{#if brazilRow && store.subtab !== 'state'}
			<p class="highlight">{summaryText(brazilRow, store.measure)}</p>
		{/if}

		{#if store.subtab === 'state'}
			<ChooseState rows={rowsOfYear} />
		{:else if store.subtab === 'map' || store.subtab === 'ranking'}
			<StateSelection rows={rowsOfYear} />
		{/if}
	{/if}
{:else if error}
	<p role="alert">{t('error.load')}</p>
{:else if !states || !topology}
	<p>{t('loading')}</p>
{:else if store.subtab === 'map'}
	<MapView {topology} rows={rowsOfYear} />
	<Legend />
{:else if store.subtab === 'ranking'}
	<StateRanking rows={rowsOfYear} brazil={brazilRow} />
{:else if store.subtab === 'regions'}
	<RegionsView />
{:else if store.selectedCode}
	<StateDetail states={states ?? []} rows={rowsOfYear} />
{:else}
	<p class="empty">{t('detail.empty')}</p>
{/if}

<style>
	.empty {
		color: var(--text-soft);
	}
</style>
