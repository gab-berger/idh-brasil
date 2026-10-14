<script>
	import { alternarUf, estado } from '#lib/estado.svelte.js';
	import { corMapa } from '#lib/escalas.js';
	import { num, posicao } from '#lib/formato.js';
	import { posicoes } from '#lib/ranking.js';
	import { t } from '#lib/textos.js';

	/** @type {{ linhas: any[], brasil?: any }} */
	let { linhas, brasil } = $props();

	const cor = $derived(corMapa(estado.medida));
	const pos = $derived(posicoes(linhas, estado.medida));
	const ordenadas = $derived([...linhas].sort((a, b) => b[estado.medida] - a[estado.medida]));
	const valorBrasil = $derived(brasil?.[estado.medida]);
</script>

<div class="lista">
	<ol aria-label={t('ranking.rotulo', { medida: t(`medida.${estado.medida}`), ano: estado.ano })}>
		{#each ordenadas as linha (linha.uf)}
			{@const valor = linha[estado.medida]}
			<li>
				<button type="button" aria-pressed={estado.ufSelecionada === linha.uf} onclick={() => alternarUf(linha.uf)}>
					<span class="posicao">{posicao(pos.get(linha.uf) ?? 0)}</span>
					<span class="nome">{linha.nome}</span>
					<span class="barra"><span style:width={`${valor * 100}%`} style:background={cor(valor)}></span></span>
					<span class="valor">{num(valor)}</span>
				</button>
			</li>
		{/each}
	</ol>

	<!-- Mesmas colunas das linhas acima (pos + nome à esquerda, valor à direita): a linha cai exatamente no valor do Brasil. -->
	{#if valorBrasil !== undefined}
		<span class="referencia" style:left={`calc(9.5rem + (100% - 13.5rem) * ${valorBrasil})`} aria-hidden="true"></span>
	{/if}
</div>
{#if valorBrasil !== undefined}
	<p class="legenda-ref">{t('ranking.brasil', { valor: num(valorBrasil) })}</p>
{/if}

<style>
	.lista {
		position: relative;
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	button {
		display: grid;
		grid-template-columns: 2.5rem 7rem minmax(0, 1fr) 4rem;
		align-items: center;
		width: 100%;
		min-height: 44px;
		padding: 0;
		border: 0;
		border-bottom: 1px solid var(--linha);
		background: transparent;
		color: var(--texto);
		font: inherit;
		text-align: left;
	}

	button[aria-pressed='true'] {
		background: var(--superficie);
		font-weight: 600;
	}

	.posicao {
		color: var(--texto-suave);
		font-variant-numeric: tabular-nums;
	}

	.nome {
		padding-right: 8px;
		font-size: 0.9rem;
		line-height: 1.2;
	}

	.barra {
		display: block;
		height: 14px;
		overflow: hidden;
		border-radius: 3px;
		background: var(--superficie);
	}

	.barra > span {
		display: block;
		height: 100%;
	}

	.valor {
		padding-left: 8px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.referencia {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--brasil);
		pointer-events: none;
	}

	.legenda-ref {
		margin: 8px 0 0;
		font-size: 0.9rem;
		color: var(--texto-suave);
	}
</style>
