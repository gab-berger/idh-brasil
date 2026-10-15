<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '#lib/texts';

	const message = $derived(page.status === 404 ? t('error.not_found') : t('error.generic'));
</script>

<svelte:head>
	<title>{message} · {t('site.title')}</title>
</svelte:head>

<div class="text">
	<h2 class="page-title">{message}</h2>
	<p><a href={resolve('/')}>{t('error.back')}</a></p>
</div>

<style>
	.page-title {
		margin: 0 0 8px;
	}
</style>
