<script lang="ts">
	import { resolve } from '$app/paths';
	import Analises from '#lib/Analises.svelte';
	import Estados from '#lib/blocos/Estados.svelte';
	import Regioes from '#lib/blocos/Regioes.svelte';
	import { t } from '#lib/textos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{t('site.titulo')}</title>
	<meta name="description" content={t('site.resumo')} />
</svelte:head>

<div class="texto">
	<h1>{t('brasil.titulo')}</h1>
	<p class="subtitulo">{t('brasil.subtitulo')}</p>
</div>

<Estados frases={data.frases} />
<Regioes />
<Analises itens={data.analises} />

<p class="seguir"><a href={resolve('/mundo')}>{t('brasil.ir_mundo')}</a></p>

<style>
	.seguir {
		margin: 40px 0 0;
	}

	.seguir a {
		display: inline-flex;
		align-items: center;
		color: var(--destaque);
		font-weight: 600;
	}
</style>
