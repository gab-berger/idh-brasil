<script lang="ts">
	import { onMount } from 'svelte';
	import { carregar } from '#lib/dados';
	import { estado } from '#lib/estado.svelte';
	import { textoExtremos, textoResumo } from '#lib/resumo';
	import { linhaUf, ufsDoAno } from '#lib/series';
	import { t } from '#lib/textos';
	import type { LinhaUf, MapaTopo, Subaba } from '#lib/tipos';
	import Regioes from './Regioes.svelte';
	import ControleTempo from './estados/ControleTempo.svelte';
	import EscolherEstado from './estados/EscolherEstado.svelte';
	import Gaveta from './estados/Gaveta.svelte';
	import Legenda from './estados/Legenda.svelte';
	import Mapa from './estados/Mapa.svelte';
	import Ranking from './estados/Ranking.svelte';
	import SelecaoEstado from './estados/SelecaoEstado.svelte';
	import SeletorMedida from './estados/SeletorMedida.svelte';

	/** Frases dos anos com texto próprio (1991, 2010 e 2024), calculadas no build. */
	let { frases }: { frases: Record<number, string> } = $props();

	/** As sub-abas, na ordem em que aparecem. */
	const SUBABAS: Subaba[] = ['mapa', 'ranking', 'regioes', 'estado'];

	let uf: LinhaUf[] | null = $state.raw(null);
	let topo: MapaTopo | null = $state.raw(null);
	let erro = $state(false);

	// Os dados só são lidos no navegador: durante o build, a página sai sem eles.
	onMount(() => {
		Promise.all([carregar<LinhaUf[]>('idhm_uf.json'), carregar<MapaTopo>('br_uf.topojson')])
			.then(([dadosUf, mapa]) => {
				uf = dadosUf;
				topo = mapa;
			})
			.catch(() => (erro = true));
	});

	const linhasAno = $derived<LinhaUf[]>(uf ? ufsDoAno<LinhaUf>(uf, estado.ano) : []);
	const linhaBrasil = $derived<LinhaUf | undefined>(uf ? linhaUf<LinhaUf>(uf, 'BR', estado.ano) : undefined);
	// Embaixo do mapa: a frase própria do ano (só no IDHM) ou, nos outros casos, o maior e o menor estado.
	const frase = $derived(
		estado.medida === 'idhm' && frases[estado.ano] ? frases[estado.ano] : textoExtremos(linhasAno, estado.medida)
	);
</script>

<div id="estados">
	{#if erro}
		<p role="alert">{t('erro.carregar')}</p>
	{:else if !uf || !topo}
		<p>{t('carregando')}</p>
	{:else}
		<div class="subabas" role="group" aria-label={t('subabas.rotulo')}>
			{#each SUBABAS as aba (aba)}
				<button type="button" aria-pressed={estado.subaba === aba} onclick={() => (estado.subaba = aba)}>
					{t(`subabas.${aba}`)}
				</button>
			{/each}
		</div>

		<ControleTempo />

		{#if linhaBrasil}
			<p class="resumo">{textoResumo(linhaBrasil, estado.medida)}</p>
		{/if}

		{#if estado.subaba === 'mapa'}
			<div class="vista vista-mapa">
				<Mapa {topo} linhas={linhasAno} />
				<SelecaoEstado linhas={linhasAno} />
				<Legenda />
				<p class="frase">{frase}</p>
				<SeletorMedida />
			</div>
		{:else if estado.subaba === 'ranking'}
			<div class="vista vista-ranking">
				<Ranking linhas={linhasAno} brasil={linhaBrasil} />
				<SelecaoEstado linhas={linhasAno} />
				<SeletorMedida />
			</div>
		{:else if estado.subaba === 'regioes'}
			<div class="vista vista-regioes">
				<Regioes />
				<SeletorMedida />
			</div>
		{:else}
			<div class="vista vista-estado">
				<EscolherEstado linhas={linhasAno} />
				{#if estado.ufSelecionada}
					<Gaveta linhas={linhasAno} />
				{:else}
					<p class="vazio">{t('gaveta.vazio')}</p>
				{/if}
			</div>
		{/if}

		<details class="nota-pesquisa">
			<summary>{t('tempo.nota.resumo')}</summary>
			<p>{t('nota.troca_pesquisa')}</p>
		</details>
	{/if}
</div>

<style>
	.subabas {
		display: flex;
		gap: 4px;
		margin: 0 0 12px;
		border-bottom: 1px solid var(--linha);
	}

	/* Sub-abas discretas: texto simples e um traço embaixo da escolhida. */
	.subabas button {
		flex: 1 1 auto;
		min-height: 44px;
		padding: 0 8px;
		border: 0;
		border-bottom: 2px solid transparent;
		background: none;
		color: var(--texto-suave);
		font: inherit;
		font-size: 0.9rem;
	}

	.subabas button[aria-pressed='true'] {
		border-bottom-color: var(--destaque);
		color: var(--texto);
		font-weight: 600;
	}

	.resumo {
		margin: 4px 0 12px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	/* O mapa tem no máximo 640 px no computador, para caber na tela junto com a linha do tempo. */
	.vista-mapa {
		max-width: 640px;
	}

	.vista-ranking,
	.vista-estado {
		max-width: 720px;
	}

	.frase {
		margin: 8px 0;
	}

	.vazio {
		color: var(--texto-suave);
	}

	.nota-pesquisa {
		margin-top: 24px;
		font-size: 0.9rem;
		color: var(--texto-suave);
	}

	.nota-pesquisa summary {
		padding: 12px 0;
		cursor: pointer;
	}

	.nota-pesquisa p {
		margin: 0 0 8px;
	}
</style>
