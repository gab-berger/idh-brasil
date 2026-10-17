<script lang="ts">
	import { onMount } from 'svelte';
	import { load } from '#lib/data';
	import { t } from '#lib/texts';
	import type { RegionRow, StateRow } from '#lib/types';
	import Compare from './evolution/Compare.svelte';
	import FocusDetail from './evolution/FocusDetail.svelte';
	import FocusSelect from './evolution/FocusSelect.svelte';

	// The page draws this block in two places: 'start' has the detail of the place in focus; 'visual' has the fixed chart that compares regions and states.
	let { part }: { part: 'start' | 'visual' } = $props();

	let states: StateRow[] | null = $state.raw(null);
	let regions: RegionRow[] | null = $state.raw(null);
	let error = $state(false);

	// The data is read only in the browser: during the build, the page comes out without it.
	onMount(() => {
		Promise.all([load<StateRow[]>('idhm_states.json'), load<RegionRow[]>('regions.json')])
			.then(([loadedStates, loadedRegions]) => {
				states = loadedStates;
				regions = loadedRegions;
			})
			.catch(() => (error = true));
	});
</script>

{#if states && regions}
	{#if part === 'visual'}
		<Compare {states} {regions} />
	{:else}
		<FocusSelect {states} />
		<FocusDetail {states} {regions} />
	{/if}
{:else if part === 'visual'}
	<!-- The fixed chart says what is happening; the detail on the left waits for the data without saying anything. -->
	{#if error}
		<p role="alert">{t('error.load')}</p>
	{:else}
		<p>{t('loading')}</p>
	{/if}
{/if}
