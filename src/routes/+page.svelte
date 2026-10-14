<script>
	import Menu from '#lib/Menu.svelte';
	import Secao from '#lib/Secao.svelte';
	import { BLOCOS } from '#lib/navegacao.js';
	import { t } from '#lib/textos.js';
</script>

<svelte:head>
	<meta name="description" content={t('site.resumo')} />
</svelte:head>

<Menu />

<main>
	<h1>{t('site.titulo')}</h1>
	<p>{t('site.resumo')}</p>

	{#each BLOCOS as bloco (bloco.id)}
		<Secao id={bloco.id} titulo={t(bloco.chave)}>
			<p>{t('placeholder.em_construcao')}</p>
		</Secao>
	{/each}
</main>
