<script lang="ts">
	import { resolve } from '$app/paths';
	import Analises from '#lib/Analises.svelte';
	import Mundo from '#lib/blocos/Mundo.svelte';
	import RankingMundo from '#lib/blocos/mundo/RankingMundo.svelte';
	import SubAbas from '#lib/SubAbas.svelte';
	import TituloSite from '#lib/TituloSite.svelte';
	import { t } from '#lib/textos';
	import type { Analise } from '#lib/tipos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Vista = 'evolucao' | 'ranking';
	let vista: Vista = $state('evolucao');

	/** As sub-abas da aba Mundo: a evolução do IDH e a posição do Brasil no ranking. */
	const VISTAS: { chave: Vista; rotulo: string }[] = [
		{ chave: 'evolucao', rotulo: t('mundo.vista.evolucao') },
		{ chave: 'ranking', rotulo: t('subabas.ranking') }
	];

	// As notas sobre os dados, no formato do rotativo da aba Brasil (um item só). Um parágrafo por linha.
	const observacao: Analise = {
		id: 'sobre-os-dados',
		titulo: t('mundo.sobre.resumo'),
		texto: [t('mundo.subtitulo'), t('nota.medias'), t('nota.brics'), t('nota.idhm_vs_idh')].join('\n')
	};
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
	<RankingMundo />
{/if}

<Analises titulo={t('mundo.observacoes.titulo')} itens={[observacao]} />

<p class="seguir"><a href={resolve('/')}>{t('mundo.ir_brasil')}</a></p>

<style>
	.resposta {
		max-width: var(--largura-texto);
	}
</style>
