<script lang="ts">
	import Menu from '#lib/Menu.svelte';
	import Secao from '#lib/Secao.svelte';
	import Abertura from '#lib/blocos/Abertura.svelte';
	import Estados from '#lib/blocos/Estados.svelte';
	import OQueE from '#lib/blocos/OQueE.svelte';
	import { BLOCOS } from '#lib/navegacao';
	import { t } from '#lib/textos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
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
			{#if bloco.id === 'abertura'}
				<Abertura abertura={data.abertura} />
			{:else if bloco.id === 'oque-e-o-idh'}
				<OQueE />
			{:else if bloco.id === 'estados'}
				<Estados />
			{:else}
				<p>{t('placeholder.em_construcao')}</p>
			{/if}
		</Secao>
	{/each}
</main>
