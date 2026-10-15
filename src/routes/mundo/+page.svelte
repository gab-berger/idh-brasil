<script lang="ts">
	import { resolve } from '$app/paths';
	import Mundo from '#lib/blocos/Mundo.svelte';
	import RankingMundo from '#lib/blocos/mundo/RankingMundo.svelte';
	import Nota from '#lib/Nota.svelte';
	import { t } from '#lib/textos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{t('abas.mundo')} · {t('site.titulo')}</title>
	<meta name="description" content={t('mundo.subtitulo')} />
</svelte:head>

<div class="texto">
	<h2 class="pagina">{t('mundo.titulo')}</h2>
	<p class="subtitulo">{t('mundo.subtitulo')}</p>
	<p>{t('mundo.posicao.lead', { posicao: data.posicao.posicao, detalhe: data.posicao.detalhe })}</p>
	<p>{data.evolucao}</p>
</div>

<Mundo />

<section class="texto" aria-labelledby="ranking-titulo">
	<h2 id="ranking-titulo">{t('mundo.ranking.titulo')}</h2>
	<RankingMundo linhas={data.vizinhos} />
	<Nota chave="nota.ranking" />
</section>

<div class="texto">
	<Nota chave="nota.medias" />
	<Nota chave="nota.brics" />
	<Nota chave="nota.idhm_vs_idh" />
	<p class="seguir"><a href={resolve('/')}>{t('mundo.ir_brasil')}</a></p>
</div>

<style>
	.pagina {
		margin: 0 0 8px;
	}

	.seguir {
		margin: 32px 0 0;
	}

	.seguir a {
		display: inline-flex;
		align-items: center;
		color: var(--destaque);
		font-weight: 600;
	}
</style>
