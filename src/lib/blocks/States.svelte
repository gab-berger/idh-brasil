<script lang="ts">
	import { onMount } from 'svelte';
	import { load } from '#lib/data';
	import { statesOfYear, stateRow } from '#lib/series';
	import { store } from '#lib/store.svelte';
	import { summaryText } from '#lib/summary';
	import { t } from '#lib/texts';
	import type { MapTopology, StateRow } from '#lib/types';
	import TimeControl from './states/TimeControl.svelte';
	import Legend from './states/Legend.svelte';
	import MapView from './states/MapView.svelte';
	import StateRanking from './states/StateRanking.svelte';
	import StateSelection from './states/StateSelection.svelte';

	// The page draws this block in two places on a wide screen: 'start' has the controls, 'visual' has the map or the list.
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
		<TimeControl />

		{#if brazilRow}
			<p class="highlight">{summaryText(brazilRow, store.measure)}</p>
		{/if}

		<StateSelection rows={rowsOfYear} />
	{/if}
{:else if error}
	<p role="alert">{t('error.load')}</p>
{:else if !states || !topology}
	<p>{t('loading')}</p>
{:else if store.subtab === 'map'}
	<MapView {topology} rows={rowsOfYear} />
	<Legend />
{:else}
	<StateRanking rows={rowsOfYear} brazil={brazilRow} />
{/if}
