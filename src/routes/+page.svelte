<script lang="ts">
	import { resolve } from '$app/paths';
	import Analysis from '#lib/Analysis.svelte';
	import Evolution from '#lib/blocks/Evolution.svelte';
	import States from '#lib/blocks/States.svelte';
	import SiteTitle from '#lib/SiteTitle.svelte';
	import MeasureSelector from '#lib/blocks/states/MeasureSelector.svelte';
	import Split from '#lib/Split.svelte';
	import SubTabs from '#lib/SubTabs.svelte';
	import { store } from '#lib/store.svelte';
	import { t } from '#lib/texts';
	import type { SubTab } from '#lib/types';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** The sub-tabs of the Brazil tab, in the order they appear. */
	const VIEWS: { key: SubTab; label: string }[] = [
		{ key: 'map', label: t('subtabs.map') },
		{ key: 'ranking', label: t('subtabs.ranking') },
		{ key: 'evolution', label: t('subtabs.evolution') }
	];
</script>

<svelte:head>
	<title>{t('site.title')}</title>
	<meta name="description" content={t('site.summary')} />
</svelte:head>

<!-- Two fixed rows under the header, on every view: the sub-tabs, and the measure right under them. They share one element, so they move together. -->
<div style:--bars-height="calc(var(--tabs-height) + var(--measures-height))">
	<SubTabs options={VIEWS} current={store.subtab} onChoose={(key) => (store.subtab = key)} label={t('subtabs.label')}>
		{#snippet extra()}
			<MeasureSelector />
		{/snippet}
	</SubTabs>

	<!-- In the evolution view the chart that compares regions and states comes first on a phone, and sits on the right on a wide screen. -->
	<Split id="states" visualFirst={store.subtab === 'evolution'}>
		{#snippet head()}
			<SiteTitle />
		{/snippet}

		{#snippet start()}
			{#if store.subtab === 'evolution'}
				<Evolution part="start" />
			{:else}
				<States part="start" />
			{/if}
		{/snippet}

		{#snippet visual()}
			{#if store.subtab === 'evolution'}
				<Evolution part="visual" />
			{:else}
				<States part="visual" />
			{/if}
		{/snippet}

		{#snippet end()}
			<Analysis items={data.analyses} />

			<!-- The notes on each period, and last, the link to the world tab. -->
			<details class="notes">
				<summary>{t('time.note.summary')}</summary>
				<p>{t('note.survey_change')}</p>
			</details>

			<p class="follow"><a href={resolve('/mundo')}>{t('brazil.go_world')}</a></p>
		{/snippet}
	</Split>
</div>

<style>
	.notes {
		margin-top: 32px;
		font-size: 0.9rem;
		color: var(--text-soft);
	}

	.notes summary {
		padding: 12px 0;
		cursor: pointer;
	}

	.notes p {
		margin: 0 0 8px;
	}

	.follow {
		margin: 24px 0 0;
	}

	.follow a {
		display: inline-flex;
		align-items: center;
		color: var(--accent);
		font-weight: 600;
	}
</style>
