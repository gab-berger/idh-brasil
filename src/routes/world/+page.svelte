<script lang="ts">
	import { resolve } from '$app/paths';
	import Analysis from '#lib/Analysis.svelte';
	import World from '#lib/blocks/World.svelte';
	import WorldRanking from '#lib/blocks/world/WorldRanking.svelte';
	import SiteTitle from '#lib/SiteTitle.svelte';
	import SubTabs from '#lib/SubTabs.svelte';
	import { t } from '#lib/texts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type View = 'evolution' | 'ranking';
	let view: View = $state('evolution');

	/** The sub-tabs of the world tab: the evolution of the HDI, and Brazil's position in the ranking. */
	const VIEWS: { key: View; label: string }[] = [
		{ key: 'evolution', label: t('world.view.evolution') },
		{ key: 'ranking', label: t('subtabs.ranking') }
	];
</script>

<svelte:head>
	<title>{t('tabs.world')} · {t('site.title')}</title>
	<meta name="description" content={t('world.subtitle')} />
</svelte:head>

<SubTabs options={VIEWS} current={view} onChoose={(key) => (view = key)} label={t('subtabs.label')} />
<SiteTitle />

<p class="highlight">{data.highlight}</p>

{#if view === 'evolution'}
	<World />
	<Analysis items={data.analyses} />
{:else}
	<WorldRanking />
{/if}

<!-- The notes on the data, collapsed. Each one has a bold title. -->
<details class="observations">
	<summary><h2>{t('world.observations.title')}</h2></summary>
	<dl>
		<dt>{t('world.notes.source')}</dt>
		<dd>{t('world.subtitle')}</dd>
		<dt>{t('world.notes.averages')}</dt>
		<dd>{t('note.averages')}</dd>
		<dt>{t('world.notes.brics')}</dt>
		<dd>{t('note.brics')}</dd>
		<dt>{t('world.notes.idhm')}</dt>
		<dd>{t('note.idhm_vs_hdi')}</dd>
	</dl>
</details>

<p class="follow"><a href={resolve('/')}>{t('world.go_brazil')}</a></p>

<style>
	.observations {
		max-width: var(--text-width);
		margin-top: 32px;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}

	.observations summary {
		padding: 12px 0;
		cursor: pointer;
	}

	.observations summary h2 {
		display: inline;
		margin: 0;
	}

	dl {
		margin: 0 0 12px;
	}

	dt {
		margin-top: 12px;
		font-weight: 600;
	}

	dd {
		margin: 2px 0 0;
		color: var(--text-soft);
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
