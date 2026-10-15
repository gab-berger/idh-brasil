<script lang="ts">
	import { onMount } from 'svelte';
	import { carregar } from '#lib/dados';
	import { estado } from '#lib/estado.svelte';
	import { textoResumo } from '#lib/resumo';
	import { linhaUf, ufsDoAno } from '#lib/series';
	import { t } from '#lib/textos';
	import type { LinhaUf, MapaTopo } from '#lib/tipos';
	import Regioes from './Regioes.svelte';
	import ControleTempo from './estados/ControleTempo.svelte';
	import EscolherEstado from './estados/EscolherEstado.svelte';
	import EstadoDetalhe from './estados/EstadoDetalhe.svelte';
	import Legenda from './estados/Legenda.svelte';
	import Mapa from './estados/Mapa.svelte';
	import Ranking from './estados/Ranking.svelte';
	import SelecaoEstado from './estados/SelecaoEstado.svelte';
	import SeletorMedida from './estados/SeletorMedida.svelte';

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
		{#if estado.subaba !== 'estado'}
			<SeletorMedida />
		{/if}

		<ControleTempo />

		{#if linhaBrasil && estado.subaba !== 'estado'}
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
					<EstadoDetalhe uf={uf ?? []} linhas={linhasAno} />
				{:else}
					<p class="vazio">{t('gaveta.vazio')}</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
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
