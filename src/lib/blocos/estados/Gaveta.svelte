<script>
	import { alternarUf, estado } from '#lib/estado.svelte.js';
	import { CORES_DIMENSAO, faixaIdhm } from '#lib/escalas.js';
	import { num, posicao } from '#lib/formato.js';
	import { posicoes } from '#lib/ranking.js';
	import { t } from '#lib/textos.js';

	/** @type {{ linhas: any[] }} */
	let { linhas } = $props();

	const DIMENSOES = /** @type {const} */ (['longevidade', 'educacao', 'renda']);
	const linha = $derived(linhas.find((l) => l.uf === estado.ufSelecionada));
	const pos = $derived(posicoes(linhas, 'idhm'));

	function fechar() {
		if (estado.ufSelecionada) alternarUf(estado.ufSelecionada);
	}

	/** @param {KeyboardEvent} evento */
	function teclar(evento) {
		if (evento.key === 'Escape') fechar();
	}
</script>

<svelte:window onkeydown={teclar} />

{#if linha}
	<!-- Sem aria-live: a gaveta muda a cada ano durante a animação, e isso não deve ser anunciado a cada passo. -->
	<section class="gaveta" aria-labelledby="gaveta-titulo">
		<header>
			<h3 id="gaveta-titulo">{linha.nome}</h3>
			<button type="button" onclick={fechar}>{t('gaveta.fechar')}</button>
		</header>

		<p class="principal">
			<strong>{num(linha.idhm)}</strong>, {t(`faixa.${faixaIdhm(linha.idhm)}`)}
		</p>
		<p class="posicao">{t('gaveta.posicao', { posicao: posicao(pos.get(linha.uf) ?? 0) })}</p>

		<h4>{t('gaveta.subindices')}</h4>
		<ul class="subindices">
			{#each DIMENSOES as dimensao (dimensao)}
				<li>
					<span class="nome">{t(`medida.${dimensao}`)}</span>
					<span class="barra"><span style:width={`${linha[dimensao] * 100}%`} style:background={CORES_DIMENSAO[dimensao]}></span></span>
					<span class="valor">{num(linha[dimensao])}</span>
				</li>
			{/each}
		</ul>

		<p class="fonte">
			{t('gaveta.fonte', { fonte: linha.fonte === 'Censo' ? t('fonte.censo') : t('fonte.pnad'), ano: linha.ano })}
		</p>
	</section>
{/if}

<style>
	.gaveta {
		margin: 16px 0;
		padding: 12px 14px;
		border: 1px solid var(--linha);
		border-radius: 8px;
		background: var(--fundo);
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}

	h3 {
		margin: 0;
		font-size: 1.15rem;
	}

	header button {
		min-height: 44px;
		padding: 0 12px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.9rem;
	}

	.principal {
		margin: 4px 0 0;
		font-size: 1.05rem;
	}

	.principal strong {
		font-size: 1.4rem;
		font-variant-numeric: tabular-nums;
	}

	.posicao {
		margin: 0;
		color: var(--texto-suave);
	}

	h4 {
		margin: 12px 0 6px;
		font-size: 0.95rem;
	}

	.subindices {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.subindices li {
		display: grid;
		grid-template-columns: 6.5rem minmax(0, 1fr) 3.25rem;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.barra {
		display: block;
		height: 12px;
		border-radius: 3px;
		background: var(--superficie);
		overflow: hidden;
	}

	.barra > span {
		display: block;
		height: 100%;
	}

	.valor {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.fonte {
		margin: 8px 0 0;
		font-size: 0.8rem;
		color: var(--texto-suave);
	}
</style>
