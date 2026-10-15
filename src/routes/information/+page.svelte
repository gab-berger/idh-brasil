<script lang="ts">
	import { dateBr } from '#lib/format';
	import SiteTitle from '#lib/SiteTitle.svelte';
	import { t, type TextKey } from '#lib/texts';
	import type { Dimension } from '#lib/types';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Each component has the text for the state index (IDHM) and the one for the global HDI (countries), as in the specification.
	const DIMENSIONS: { measure: Dimension; idhm: TextKey; hdi: TextKey }[] = [
		{ measure: 'longevity', idhm: 'about.longevity.idhm', hdi: 'about.longevity.hdi' },
		{ measure: 'education', idhm: 'about.education.idhm', hdi: 'about.education.hdi' },
		{ measure: 'income', idhm: 'about.income.idhm', hdi: 'about.income.hdi' }
	];
</script>

<svelte:head>
	<title>{t('tabs.information')} · {t('site.title')}</title>
	<meta name="description" content={t('info.subtitle')} />
</svelte:head>

<SiteTitle />

<div class="text">
	<h2 class="page-title">{t('info.title')}</h2>
	<p class="subtitle">{t('info.subtitle')}</p>

	<!-- Questions that open and close: you can read only the titles and open what interests you. -->
	<details open>
		<summary><h2>{t('info.question.about')}</h2></summary>
		<p>{t('about.definition')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.dimensions')}</h2></summary>
		{#each DIMENSIONS as dimension (dimension.measure)}
			<section class="dimension">
				<h3>{t(`measure.${dimension.measure}`)}</h3>
				<dl>
					<dt>{t('about.dimensions.idhm')}</dt>
					<dd>{t(dimension.idhm)}</dd>
					<dt>{t('about.dimensions.hdi')}</dt>
					<dd>{t(dimension.hdi)}</dd>
				</dl>
			</section>
		{/each}
	</details>

	<details>
		<summary><h2>{t('info.question.average')}</h2></summary>
		<p><strong>{t('about.geometric_average.title')}</strong> {t('about.geometric_average')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.bands')}</h2></summary>
		<p>{t('about.bands.idhm')}</p>
		<p>{t('about.bands.hdi')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.scales')}</h2></summary>
		<p><strong>{t('about.table.title')}</strong></p>
		<p>{t('note.idhm_vs_hdi')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.break')}</h2></summary>
		<p>{t('note.survey_change')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.averages')}</h2></summary>
		<p>{t('info.averages.regions')}</p>
		<p>{t('note.averages')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.ranking')}</h2></summary>
		<p>{t('note.ranking')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.brics')}</h2></summary>
		<p>{t('note.brics')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.sources')}</h2></summary>
		<ul class="sources">
			{#each data.sources as source (source.id)}
				<li>
					<a href={source.url}>{source.name}</a>.
					{t('info.source', { edition: source.edition, license: source.license, date: dateBr(source.access_date) })}
				</li>
			{/each}
		</ul>
		<p class="credits">{t('credits')}</p>
	</details>
</div>

<style>
	.page-title {
		margin: 0 0 8px;
	}

	details {
		border-bottom: 1px solid var(--line);
	}

	summary {
		padding: 10px 0;
		cursor: pointer;
	}

	summary h2 {
		display: inline;
		margin: 0;
		font-size: 1.1rem;
	}

	details > :not(summary) {
		margin-top: 0;
	}

	details[open] {
		padding-bottom: 12px;
	}

	.dimension {
		margin: 0 0 12px;
	}

	h3 {
		margin: 0 0 4px;
		font-size: 1rem;
	}

	dl {
		display: grid;
		gap: 4px 10px;
		margin: 0;
	}

	dt {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-soft);
	}

	dd {
		margin: 0 0 6px;
	}

	.sources {
		margin: 0 0 12px;
		padding-left: 20px;
	}

	.sources li {
		margin-bottom: 8px;
	}

	.sources a {
		color: var(--accent);
	}

	.credits {
		font-size: 0.9rem;
		color: var(--text-soft);
	}
</style>
