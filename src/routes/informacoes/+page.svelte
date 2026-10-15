<script lang="ts">
	import { dateBr } from '#lib/format';
	import SiteTitle from '#lib/SiteTitle.svelte';
	import { t, type TextKey } from '#lib/texts';
	import type { Dimension, IdhmBand } from '#lib/types';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Each component has the text for the state index (IDHM) and the one for the global HDI (countries), as in the specification.
	const DIMENSIONS: { measure: Dimension; name: TextKey; idhm: TextKey; hdi: TextKey }[] = [
		{ measure: 'longevity', name: 'about.longevity.dimension', idhm: 'about.longevity.idhm', hdi: 'about.longevity.hdi' },
		{ measure: 'education', name: 'about.education.dimension', idhm: 'about.education.idhm', hdi: 'about.education.hdi' },
		{ measure: 'income', name: 'about.income.dimension', idhm: 'about.income.idhm', hdi: 'about.income.hdi' }
	];

	// The bands of the two indices side by side; the global HDI has no "very low" band. A test checks the limits against the code.
	const BANDS: { band: IdhmBand; idhm: TextKey; hdi: TextKey | null }[] = [
		{ band: 'very_low', idhm: 'about.bands.idhm.very_low', hdi: null },
		{ band: 'low', idhm: 'about.bands.idhm.low', hdi: 'about.bands.hdi.low' },
		{ band: 'medium', idhm: 'about.bands.idhm.medium', hdi: 'about.bands.hdi.medium' },
		{ band: 'high', idhm: 'about.bands.idhm.high', hdi: 'about.bands.hdi.high' },
		{ band: 'very_high', idhm: 'about.bands.idhm.very_high', hdi: 'about.bands.hdi.very_high' }
	];

	// Words of the indicators that a reader may not know.
	const TERMS: { term: TextKey; text: TextKey }[] = [
		{ term: 'info.terms.limits.term', text: 'info.terms.limits' },
		{ term: 'info.terms.log.term', text: 'info.terms.log' },
		{ term: 'info.terms.ppp.term', text: 'info.terms.ppp' }
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

	<!-- Questions that open and close, from the most asked to the most specific: you can read only the titles and open what interests you. -->
	<details open>
		<summary><h2>{t('info.question.about')}</h2></summary>
		<p>{t('about.definition')}</p>
		<p>{t('about.origin')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.idhm')}</h2></summary>
		<p>{t('about.idhm')}</p>
		<p>{t('about.idhm.scope')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.bands')}</h2></summary>
		<p>{t('info.bands.lead')}</p>
		<table class="bands">
			<caption class="sr-only">{t('info.bands.caption')}</caption>
			<thead>
				<tr>
					<th scope="col">{t('info.bands.band')}</th>
					<th scope="col">{t('about.dimensions.idhm')}</th>
					<th scope="col">{t('about.dimensions.hdi')}</th>
				</tr>
			</thead>
			<tbody>
				{#each BANDS as row (row.band)}
					<tr>
						<th scope="row">{t(`band.${row.band}`)}</th>
						<td>{t(row.idhm)}</td>
						<td class:none={row.hdi === null}>{row.hdi ? t(row.hdi) : t('info.bands.none')}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<p>{t('info.bands.map')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.dimensions')}</h2></summary>
		<p>{t('info.dimensions.lead')}</p>
		{#each DIMENSIONS as dimension (dimension.measure)}
			<section class="dimension">
				<h3>{t(`measure.${dimension.measure}`)}: {t(dimension.name)}</h3>
				<dl>
					<dt>{t('about.dimensions.idhm')}</dt>
					<dd>{t(dimension.idhm)}</dd>
					<dt>{t('about.dimensions.hdi')}</dt>
					<dd>{t(dimension.hdi)}</dd>
				</dl>
			</section>
		{/each}
		<section class="dimension">
			<h3>{t('info.terms.title')}</h3>
			<dl>
				{#each TERMS as term (term.term)}
					<dt>{t(term.term)}</dt>
					<dd>{t(term.text)}</dd>
				{/each}
			</dl>
		</section>
	</details>

	<details>
		<summary><h2>{t('info.question.scales')}</h2></summary>
		<p><strong>{t('about.table.title')}</strong></p>
		<p>{t('info.scales.tabs')} {t('note.idhm_vs_hdi')}</p>
		<p>{t('info.scales.bands')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.break')}</h2></summary>
		<p>{t('info.years.text')}</p>
		<p>{t('info.years.compare')}</p>
		<p>{t('info.years.world')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.limits')}</h2></summary>
		<p>{t('about.limits')}</p>
		<p>{t('about.limits.whole')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.sources')}</h2></summary>
		<p>{t('info.sources.lead')}</p>
		<ul class="sources">
			{#each data.sources as source (source.id)}
				<li>
					<a href={source.url}>{source.name}</a>.
					{t('info.source', { edition: source.edition, license: source.license, date: dateBr(source.access_date) })}
				</li>
			{/each}
		</ul>
		<p>{t('info.sources.revisions')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.average')}</h2></summary>
		<p>{t('about.geometric_average')}</p>
		<p>{t('about.geometric_average.example')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.averages')}</h2></summary>
		<p><strong>{t('info.averages.regions.title')}</strong> {t('info.averages.regions')}</p>
		<p><strong>{t('info.averages.world.title')}</strong> {t('info.averages.world')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.ranking')}</h2></summary>
		<p>{t('info.ranking.others')}</p>
		<p><strong>{t('info.ranking.states.title')}</strong> {t('info.ranking.states')}</p>
		<p><strong>{t('info.ranking.countries.title')}</strong> {t('info.ranking.countries')}</p>
		<p>{t('info.ranking.ties')}</p>
	</details>

	<details>
		<summary><h2>{t('info.question.brics')}</h2></summary>
		<p>{t('note.brics')}</p>
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

	/* The bands of the two indices side by side, so the different limits show at a glance. */
	.bands {
		width: 100%;
		margin: 0 0 12px;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}

	.bands th,
	.bands td {
		padding: 6px 8px 6px 0;
		border-bottom: 1px solid var(--line);
		text-align: left;
		vertical-align: top;
	}

	/* A range stays on one line; only the band name may wrap on a narrow phone. */
	.bands td {
		white-space: nowrap;
	}

	.bands thead th {
		font-size: 0.85rem;
		color: var(--text-soft);
	}

	.bands tbody th::first-letter {
		text-transform: uppercase;
	}

	.bands .none {
		color: var(--text-soft);
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
</style>
