<script lang="ts">
	import { num, posicao } from '#lib/formato';
	import { t } from '#lib/textos';
	import type { LinhaRanking } from '#lib/tipos';

	let { linhas }: { linhas: LinhaRanking[] } = $props();
</script>

<ol class="ranking" aria-label={t('mundo.ranking.rotulo')}>
	{#each linhas as linha (linha.iso3)}
		<li class:brasil={linha.brasil}>
			<span class="posicao">{posicao(linha.posicao)}</span>
			<span class="nome">
				{linha.nome}
				{#if linha.empate}<span class="empate">({t('mundo.ranking.empate')})</span>{/if}
			</span>
			<span class="valor">{num(linha.idh)}</span>
		</li>
	{/each}
</ol>

<style>
	.ranking {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--linha);
	}

	li {
		display: grid;
		grid-template-columns: 3.5rem minmax(0, 1fr) 4.5rem;
		align-items: center;
		min-height: 40px;
		padding: 4px 10px;
		border-bottom: 1px solid var(--linha);
		font-variant-numeric: tabular-nums;
	}

	/* O Brasil é destacado pela faixa à esquerda, na cor do Brasil nos gráficos. */
	li.brasil {
		background: var(--superficie);
		font-weight: 600;
		box-shadow: inset 4px 0 0 var(--brasil);
	}

	.posicao {
		color: var(--texto-suave);
	}

	.valor {
		text-align: right;
	}

	.empate {
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--texto-suave);
	}
</style>
