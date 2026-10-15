<script lang="ts">
	import { onMount } from 'svelte';
	import { carregar } from '#lib/dados';
	import { estado } from '#lib/estado.svelte';
	import { textoExtremos, textoResumo } from '#lib/resumo';
	import { linhaUf, ufsDoAno } from '#lib/series';
	import { t } from '#lib/textos';
	import type { LinhaUf, MapaTopo } from '#lib/tipos';
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
		<div class="topo">
			<SeletorMedida />
			<div class="resumo">
				{#if linhaBrasil}
					<p>{textoResumo(linhaBrasil, estado.medida)}</p>
				{/if}
				<BotaoTocar />
			</div>
		</div>

		<div class="vista" role="group" aria-label={t('vista.rotulo')}>
			<button type="button" aria-pressed={estado.vista === 'mapa'} onclick={() => (estado.vista = 'mapa')}>
				{t('vista.mapa')}
			</button>
			<button type="button" aria-pressed={estado.vista === 'ranking'} onclick={() => (estado.vista = 'ranking')}>
				{t('vista.ranking')}
			</button>
		</div>

		<!-- A ordem do HTML é a do celular (mapa ou ranking, depois a ficha). No computador, o mapa fica à esquerda,
		     o ranking à direita e a ficha embaixo do mapa. -->
		<div class="painel" class:ver-ranking={estado.vista === 'ranking'}>
			<div class="area-mapa">
				<Mapa {topo} linhas={linhasAno} />
				<Legenda />
				<p class="frase">{frase}</p>
				<EscolherEstado linhas={linhasAno} />
			</div>
			<div class="area-ranking">
				<Ranking linhas={linhasAno} brasil={linhaBrasil} />
			</div>
			<div class="area-ficha">
				<Gaveta linhas={linhasAno} />
			</div>
		</div>

		<ControleTempo />
	{/if}
</div>

<style>
	.topo {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 24px;
	}

	.topo > :global(.seletor) {
		flex: 1 1 340px;
	}

	.resumo {
		display: flex;
		flex: 1 1 280px;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.resumo p {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.vista {
		display: flex;
		gap: 8px;
		margin: 16px 0;
	}

	.vista button {
		flex: 1;
		min-height: 44px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
	}

	.vista button[aria-pressed='true'] {
		border-color: var(--texto);
		font-weight: 600;
	}

	.painel {
		display: flex;
		flex-direction: column;
		margin-top: 16px;
	}

	.frase {
		margin: 8px 0;
	}

	/* No celular, mapa e ranking se alternam pelos botões acima. */
	@media (max-width: 959.98px) {
		.painel.ver-ranking .area-mapa {
			display: none;
		}

		.painel:not(.ver-ranking) .area-ranking {
			display: none;
		}
	}

	/* No computador, tudo cabe na tela: os botões de alternar somem e o ranking fica ao lado. */
	@media (min-width: 960px) {
		.vista {
			display: none;
		}

		.painel {
			display: grid;
			grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
			grid-template-areas:
				'mapa ranking'
				'ficha ranking';
			align-items: start;
			column-gap: 32px;
		}

		.area-mapa {
			grid-area: mapa;
		}

		.area-ficha {
			grid-area: ficha;
		}

		.area-ranking {
			grid-area: ranking;
		}
	}
</style>
