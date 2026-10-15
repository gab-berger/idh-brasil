<script lang="ts">
	import { t } from '#lib/texts';
</script>

<div class="site-title text">
	<h1>{t('site.title')}</h1>
	<p>{t('site.subtitle')}</p>
</div>

<style>
	/* The title and the subtitle come right under the chart choice. They are not fixed: they scroll with the page. */
	.site-title {
		margin: 16px 0 12px;
	}

	p {
		margin: 0;
		font-size: 0.85rem;
		white-space: pre-line;
		color: var(--text-soft);
	}
</style>
