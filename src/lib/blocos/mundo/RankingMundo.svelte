<script lang="ts">
	import { onMount } from 'svelte';
	import { carregar } from '#lib/dados';
	import { num, posicao } from '#lib/formato';
	import { rankingDoAno } from '#lib/mundo';
	import { t } from '#lib/textos';
	import type { RankingAnos } from '#lib/tipos';

	// Altura de cada linha, em px (a mesma do CSS). Com ela, o Brasil cai no meio da caixa.
	const ALTURA_LINHA = 36;

	let dados = $state.raw<RankingAnos | null>(null);
	let erro = $state(false);
	let ano = $state(2023);
	let caixa: HTMLElement | undefined = $state();

	// Os dados são lidos no navegador. A lista começa no último ano do conjunto.
	onMount(() => {
		carregar<RankingAnos>('ranking_anos.json')
			.then((recebidos) => {
				dados = recebidos;
				ano = recebidos.anos[recebidos.anos.length - 1];
			})
			.catch(() => (erro = true));
	});

	const anos = $derived(dados?.anos ?? []);
	const linhas = $derived(dados ? rankingDoAno(dados, ano) : []);
	const indiceAno = $derived(anos.indexOf(ano));
	const indiceBrasil = $derived(linhas.findIndex((linha) => linha.brasil));

	// Ao abrir a lista e ao trocar de ano, o Brasil fica no meio da caixa.
	$effect(() => {
		if (!caixa || indiceBrasil < 0) return;
		caixa.scrollTop = Math.max(0, indiceBrasil * ALTURA_LINHA - (caixa.clientHeight - ALTURA_LINHA) / 2);
	});

	function passar(passo: number): void {
		const novo = anos[indiceAno + passo];
		if (novo !== undefined) ano = novo;
	}
</script>

{#if erro}
	<p role="alert">{t('erro.carregar')}</p>
{:else if !dados}
	<p>{t('carregando')}</p>
{:else}
	<section aria-labelledby="ranking-titulo">
		<h2 id="ranking-titulo">{t('mundo.ranking.titulo', { ano })}</h2>

		<div class="controles">
			<label class="ano">
				<span>{t('mundo.ranking.ano')}</span>
				<select bind:value={ano}>
					{#each anos as opcao (opcao)}
						<option value={opcao}>{opcao}</option>
					{/each}
				</select>
			</label>
			<div class="passos">
				<button type="button" onclick={() => passar(-1)} disabled={indiceAno <= 0}>{t('tempo.anterior')}</button>
				<button type="button" onclick={() => passar(1)} disabled={indiceAno >= anos.length - 1}>
					{t('tempo.proximo')}
				</button>
			</div>
		</div>

		<p class="total">{t('mundo.ranking.total', { n: linhas.length, ano })}</p>

		<!-- A caixa rola: por isso aceita o foco do teclado, para quem não usa o mouse. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="caixa" bind:this={caixa} role="region" tabindex="0" aria-label={t('mundo.ranking.rotulo', { ano })}>
			<ol>
				{#each linhas as linha (linha.iso3)}
					<li class:brasil={linha.brasil}>
						<span class="posicao">{#if linha.empate}<span aria-hidden="true">=</span><span class="sr-only">empate </span>{/if}{posicao(linha.posicao)}</span>
						<span class="nome">
							{linha.nome}
						</span>
						<span class="valor">{num(linha.idh)}</span>
					</li>
				{/each}
			</ol>
		</div>

		<p class="nota">{t('mundo.ranking.nota')}</p>
	</section>
{/if}

<style>
	section {
		max-width: var(--largura-texto);
	}

	.controles {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		margin: 8px 0 4px;
	}

	.ano {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	select {
		min-height: 44px;
		padding: 0 8px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
	}

	.passos {
		display: flex;
		gap: 6px;
	}

	.passos button {
		position: relative;
		min-height: 34px;
		padding: 0 12px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.9rem;
	}

	.passos button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.passos button:disabled {
		color: var(--texto-suave);
	}

	.total {
		margin: 4px 0 8px;
		font-size: 0.9rem;
		color: var(--texto-suave);
	}

	/* Onze linhas de altura: a lista rola dentro da caixa, e o Brasil fica preso à borda. */
	.caixa {
		height: 396px;
		overflow-y: auto;
		overscroll-behavior: contain;
		border-top: 1px solid var(--linha);
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 3.5rem minmax(0, 1fr) 4.5rem;
		align-items: center;
		box-sizing: border-box;
		height: 36px;
		padding: 0 10px;
		border-bottom: 1px solid var(--linha);
		background: var(--fundo);
		font-variant-numeric: tabular-nums;
	}

	/* Em cima da caixa quando a lista já passou do Brasil; embaixo quando ainda não chegou a ele. */
	li.brasil {
		position: sticky;
		top: 0;
		bottom: 0;
		z-index: 1;
		background: var(--superficie);
		box-shadow: inset 4px 0 0 var(--brasil);
		font-weight: 600;
	}

	.posicao {
		color: var(--texto-suave);
	}

	.valor {
		text-align: right;
	}

	.nota {
		margin: 8px 0 0;
		font-size: 0.9rem;
		color: var(--texto-suave);
	}
</style>
