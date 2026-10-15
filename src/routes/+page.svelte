<script lang="ts">
	import { resolve } from '$app/paths';
	import Analysis from '#lib/Analysis.svelte';
	import States from '#lib/blocks/States.svelte';
	import SiteTitle from '#lib/SiteTitle.svelte';
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
		{ key: 'regions', label: t('subtabs.regions') },
		{ key: 'state', label: t('subtabs.state') }
	];
</script>

<svelte:head>
	<title>{t('site.title')}</title>
	<meta name="description" content={t('site.summary')} />
</svelte:head>

<SubTabs options={VIEWS} current={store.subtab} onChoose={(key) => (store.subtab = key)} label={t('subtabs.label')} />

<Split id="states">
	{#snippet start()}
		<SiteTitle />
		<States part="start" />
	{/snippet}

	{#snippet visual()}
		<States part="visual" />
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
