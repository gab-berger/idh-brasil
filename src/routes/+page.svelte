<script lang="ts">
	import { resolve } from '$app/paths';
	import Analises from '#lib/Analises.svelte';
	import Estados from '#lib/blocos/Estados.svelte';
	import SubAbas from '#lib/SubAbas.svelte';
	import TituloSite from '#lib/TituloSite.svelte';
	import { estado } from '#lib/estado.svelte';
	import { t } from '#lib/textos';
	import type { Subaba } from '#lib/tipos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** As sub-abas da aba Brasil, na ordem em que aparecem. */
	const VISTAS: { chave: Subaba; rotulo: string }[] = [
		{ chave: 'mapa', rotulo: t('subabas.mapa') },
		{ chave: 'ranking', rotulo: t('subabas.ranking') },
		{ chave: 'regioes', rotulo: t('subabas.regioes') },
		{ chave: 'estado', rotulo: t('subabas.estado') }
	];
</script>

<svelte:head>
	<title>{t('site.titulo')}</title>
	<meta name="description" content={t('site.resumo')} />
</svelte:head>

<SubAbas opcoes={VISTAS} atual={estado.subaba} aoEscolher={(chave) => (estado.subaba = chave)} rotulo={t('subabas.rotulo')} />
<TituloSite />

<Estados />

<Analises itens={data.analises} />

<!-- Os dados de cada período, e por último o link para a aba Mundo. -->
<details class="notas">
	<summary>{t('tempo.nota.resumo')}</summary>
	<p>{t('nota.troca_pesquisa')}</p>
</details>

<p class="seguir"><a href={resolve('/mundo')}>{t('brasil.ir_mundo')}</a></p>
