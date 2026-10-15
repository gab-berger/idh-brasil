<script lang="ts">
	import { onMount } from 'svelte';
	import Nota from '#lib/Nota.svelte';
	import { carregar } from '#lib/dados';
	import { definirDaltonismo, estado } from '#lib/estado.svelte';
	import { linhaUf, ufsDoAno } from '#lib/series';
	import { t } from '#lib/textos';
	import type { LinhaUf, MapaTopo } from '#lib/tipos';
	import ControleTempo from './estados/ControleTempo.svelte';
	import Gaveta from './estados/Gaveta.svelte';
	import Legenda from './estados/Legenda.svelte';
	import Mapa from './estados/Mapa.svelte';
	import Ranking from './estados/Ranking.svelte';
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

{#if erro}
	<p role="alert">{t('erro.carregar')}</p>
{:else if !uf || !topo}
	<p>{t('carregando')}</p>
{:else}
	<SeletorMedida />

	<div class="vista" role="group" aria-label={t('vista.rotulo')}>
		<button type="button" aria-pressed={estado.vista === 'mapa'} onclick={() => (estado.vista = 'mapa')}>
			{t('vista.mapa')}
		</button>
		<button type="button" aria-pressed={estado.vista === 'ranking'} onclick={() => (estado.vista = 'ranking')}>
			{t('vista.ranking')}
		</button>
	</div>

	{#if estado.vista === 'mapa'}
		<Mapa {topo} linhas={linhasAno} />
		<Legenda />
	{:else}
		<Ranking linhas={linhasAno} brasil={linhaBrasil} />
	{/if}

	<div class="daltonismo">
		<label>
			<input
				type="checkbox"
				checked={estado.daltonismo}
				aria-describedby="ajuda-daltonismo"
				onchange={(evento) => definirDaltonismo(evento.currentTarget.checked)}
			/>
			{t('paleta.daltonismo')}
		</label>
		<p id="ajuda-daltonismo">{t('paleta.daltonismo.ajuda')}</p>
	</div>

	<Gaveta linhas={linhasAno} />
	<ControleTempo />

	<Nota chave="nota.troca_pesquisa" />
{/if}

<style>
	.daltonismo {
		margin: 0 0 12px;
	}

	.daltonismo label {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		cursor: pointer;
	}

	.daltonismo input {
		width: 1.25rem;
		height: 1.25rem;
		margin: 0;
		accent-color: var(--destaque);
	}

	.daltonismo p {
		margin: 0 0 4px;
		font-size: 0.85rem;
		color: var(--texto-suave);
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
</style>
