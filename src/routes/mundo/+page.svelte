<script lang="ts">
	import { resolve } from '$app/paths';
	import Analises from '#lib/Analises.svelte';
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
	<Analises itens={data.analises} />
{:else}
	<RankingMundo />
{/if}

<!-- As observações sobre os dados, recolhidas. Cada uma tem um título em negrito. -->
<details class="observacoes">
	<summary><h2>{t('mundo.observacoes.titulo')}</h2></summary>
	<dl>
		<dt>{t('mundo.notas.fonte')}</dt>
		<dd>{t('mundo.subtitulo')}</dd>
		<dt>{t('mundo.notas.medias')}</dt>
		<dd>{t('nota.medias')}</dd>
		<dt>{t('mundo.notas.brics')}</dt>
		<dd>{t('nota.brics')}</dd>
		<dt>{t('mundo.notas.idhm')}</dt>
		<dd>{t('nota.idhm_vs_idh')}</dd>
	</dl>
</details>

<p class="seguir"><a href={resolve('/')}>{t('mundo.ir_brasil')}</a></p>

<style>
	.observacoes {
		max-width: var(--largura-texto);
		margin-top: 32px;
		border-top: 1px solid var(--linha);
		border-bottom: 1px solid var(--linha);
	}

	.observacoes summary {
		padding: 12px 0;
		cursor: pointer;
	}

	.observacoes summary h2 {
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
		color: var(--texto-suave);
	}
</style>
