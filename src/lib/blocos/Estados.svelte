<script lang="ts">
	import { onMount } from 'svelte';
	import { carregar } from '#lib/dados';
	import { estado } from '#lib/estado.svelte';
	import { textoResumo } from '#lib/resumo';
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

		<SeletorMedida />

		<ControleTempo />

		{#if linhaBrasil}
			<p class="destaque">{textoResumo(linhaBrasil, estado.medida)}</p>
		{/if}

		{#if estado.subaba === 'mapa'}
			<div class="vista vista-mapa">
				<Mapa {topo} linhas={linhasAno} />
				<SelecaoEstado linhas={linhasAno} />
				<Legenda />
			</div>
		{:else if estado.subaba === 'ranking'}
			<div class="vista vista-ranking">
				<Ranking linhas={linhasAno} brasil={linhaBrasil} />
				<SelecaoEstado linhas={linhasAno} />
			</div>
		{:else if estado.subaba === 'regioes'}
			<div class="vista vista-regioes">
				<Regioes />
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
	{/if}
</div>

<style>
	/* As sub-abas são blocos: o escolhido fica azul inteiro, com o texto branco. */
	.subabas {
		display: flex;
		gap: 6px;
		margin: 0 0 12px;
	}

	.subabas button {
		flex: 1 1 auto;
		min-height: 44px;
		padding: 0 8px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.9rem;
	}

	.subabas button[aria-pressed='true'] {
		border-color: var(--destaque);
		background: var(--destaque);
		color: var(--fundo);
		font-weight: 600;
	}

	.destaque {
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

	.vazio {
		color: var(--texto-suave);
	}
</style>
