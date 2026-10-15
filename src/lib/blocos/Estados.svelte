<script lang="ts">
	import { onMount } from 'svelte';
	import { carregar } from '#lib/dados';
	import { estado } from '#lib/estado.svelte';
	import { textoExtremos, textoResumo } from '#lib/resumo';
	import { linhaUf, ufsDoAno } from '#lib/series';
	import { t } from '#lib/textos';
	import type { LinhaUf, MapaTopo, Subaba } from '#lib/tipos';
	import Regioes from './Regioes.svelte';
	import BotaoTocar from './estados/BotaoTocar.svelte';
	import ControleTempo from './estados/ControleTempo.svelte';
	import EscolherEstado from './estados/EscolherEstado.svelte';
	import Gaveta from './estados/Gaveta.svelte';
	import Legenda from './estados/Legenda.svelte';
	import Mapa from './estados/Mapa.svelte';
	import Ranking from './estados/Ranking.svelte';
	import SeletorMedida from './estados/SeletorMedida.svelte';

	/** Frases dos anos com texto próprio (1991, 2010 e 2024), calculadas no build. */
	let { frases }: { frases: Record<number, string> } = $props();

	/** As sub-abas, na ordem em que aparecem. */
	const SUBABAS: Subaba[] = ['mapa', 'ranking', 'regioes'];

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

		<div class="resumo">
			{#if linhaBrasil}
				<p>{textoResumo(linhaBrasil, estado.medida)}</p>
			{/if}
			<BotaoTocar />
		</div>

		<!-- A ordem do HTML é a do celular: o conteúdo e depois a ficha. No computador, a ficha fica ao lado. -->
		<div class="conteudo" class:sem-ficha={estado.subaba === 'regioes'}>
			<div class="principal">
				{#if estado.subaba === 'mapa'}
					<Mapa {topo} linhas={linhasAno} />
					<Legenda />
					<p class="frase">{frase}</p>
				{:else if estado.subaba === 'ranking'}
					<Ranking linhas={linhasAno} brasil={linhaBrasil} />
				{:else}
					<Regioes />
				{/if}
				<SeletorMedida />
			</div>

			{#if estado.subaba !== 'regioes'}
				<aside class="ficha" aria-label={t('gaveta.rotulo')}>
					<EscolherEstado linhas={linhasAno} />
					{#if estado.ufSelecionada}
						<Gaveta linhas={linhasAno} />
					{:else}
						<p class="vazio">{t('gaveta.vazio')}</p>
					{/if}
				</aside>
			{/if}
		</div>

		<ControleTempo />
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin: 0 0 12px;
	}

	.resumo p {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.conteudo {
		display: flex;
		flex-direction: column;
	}

	.frase {
		margin: 8px 0;
	}

	.ficha {
		margin-top: 8px;
	}

	/* A dica de "escolha um estado" só aparece no computador, onde a ficha fica ao lado. */
	.vazio {
		display: none;
	}

	/* No computador, o mapa (ou o ranking) e a ficha lado a lado. */
	@media (min-width: 960px) {
		.conteudo {
			display: grid;
			grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
			align-items: start;
			column-gap: 32px;
		}

		.conteudo.sem-ficha {
			grid-template-columns: minmax(0, 1fr);
		}

		.ficha {
			margin-top: 0;
		}

		.vazio {
			display: block;
			color: var(--texto-suave);
		}
	}
</style>
