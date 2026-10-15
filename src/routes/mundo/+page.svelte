<script lang="ts">
	import { resolve } from '$app/paths';
	import Mundo from '#lib/blocos/Mundo.svelte';
	import RankingMundo from '#lib/blocos/mundo/RankingMundo.svelte';
	import SubAbas from '#lib/SubAbas.svelte';
	import TituloSite from '#lib/TituloSite.svelte';
	import { t } from '#lib/textos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Vista = 'evolucao' | 'ranking';
	let vista: Vista = $state('evolucao');

	/** As sub-abas da aba Mundo: a evolução do IDH e a posição do Brasil no ranking. */
	const VISTAS: { chave: Vista; rotulo: string }[] = [
		{ chave: 'evolucao', rotulo: t('mundo.vista.evolucao') },
		{ chave: 'ranking', rotulo: t('subabas.ranking') }
	];
</script>

<svelte:head>
	<title>{t('abas.mundo')} · {t('site.titulo')}</title>
	<meta name="description" content={t('mundo.subtitulo')} />
</svelte:head>

<SubAbas opcoes={VISTAS} atual={vista} aoEscolher={(chave) => (vista = chave)} rotulo={t('subabas.rotulo')} />
<TituloSite />

<p class="destaque">{data.destaque}</p>

{#if vista === 'evolucao'}
	<Mundo />
	<p class="resposta">{data.evolucao}</p>
{:else}
	<section aria-labelledby="ranking-titulo">
		<h2 id="ranking-titulo">{t('mundo.ranking.titulo')}</h2>
		<RankingMundo linhas={data.vizinhos} />
		<p class="nota-linha">{t('nota.ranking')}</p>
	</section>
{/if}

<!-- Como os números foram calculados, recolhido; por último, o link de volta ao Brasil. -->
<details class="notas">
	<summary>{t('mundo.sobre.resumo')}</summary>
	<p>{t('mundo.subtitulo')}</p>
	<p>{t('nota.medias')}</p>
	<p>{t('nota.brics')}</p>
	<p>{t('nota.idhm_vs_idh')}</p>
</details>

<p class="seguir"><a href={resolve('/')}>{t('mundo.ir_brasil')}</a></p>

<style>
	h2 {
		margin: 16px 0 8px;
	}

	.resposta,
	.notas,
	section {
		max-width: var(--largura-texto);
	}

	.nota-linha {
		margin: 8px 0 0;
		font-size: 0.9rem;
		color: var(--texto-suave);
	}
</style>
