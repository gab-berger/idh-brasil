<script lang="ts">
	import Nota from '#lib/Nota.svelte';
	import { estado, irParaAno } from '#lib/estado.svelte';
	import type { Abertura } from '#lib/abertura';
	import { t } from '#lib/textos';

	let { abertura }: { abertura: Abertura } = $props();

	/** Leva o mapa ao ano escolhido e rola até o bloco 3. */
	function verNoMapa(ano: number): void {
		estado.medida = 'idhm';
		estado.vista = 'mapa';
		irParaAno(ano);
		const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		document.getElementById('estados')?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth' });
	}
</script>

<div class="numeros" role="group" aria-label={t('abertura.numeros.rotulo')}>
	<article class="cartao">
		<h3>{t('abertura.cartao.idhm')}</h3>
		<p class="valor">{abertura.idhm.valor}</p>
		<p class="detalhe">{abertura.idhm.faixa}</p>
	</article>

	<article class="cartao">
		<h3>{t('abertura.cartao.extremos')}</h3>
		<p class="linha">
			<span>{t('abertura.cartao.extremos.maior')}</span>
			{abertura.extremos.maior.nome}, {abertura.extremos.maior.valor}
		</p>
		<p class="linha">
			<span>{t('abertura.cartao.extremos.menor')}</span>
			{abertura.extremos.menor.nome}, {abertura.extremos.menor.valor}
		</p>
	</article>

	<article class="cartao">
		<h3>{t('abertura.cartao.mundo')}</h3>
		<p class="valor">{abertura.mundo.posicao}</p>
		<p class="detalhe">{abertura.mundo.detalhe}</p>
	</article>
</div>

<div class="anos" role="group" aria-label={t('abertura.anos.rotulo')}>
	{#each abertura.anos as item (item.ano)}
		<button type="button" class="cartao-ano" onclick={() => verNoMapa(item.ano)}>
			<span class="ano">{item.ano}</span>
			<span class="frase">{item.frase}</span>
			<span class="acao">{t('abertura.ano.acao')}</span>
		</button>
	{/each}
</div>

<Nota chave="nota.idhm_vs_idh" />

<style>
	.numeros {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
		margin: 8px 0 16px;
	}

	.cartao {
		margin: 0;
		padding: 14px;
		border: 1px solid var(--linha);
		border-radius: 8px;
		background: var(--fundo);
	}

	.cartao h3 {
		margin: 0 0 6px;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--texto-suave);
	}

	.valor {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}

	.detalhe {
		margin: 4px 0 0;
		font-size: 0.95rem;
	}

	.linha {
		margin: 4px 0 0;
	}

	.linha span {
		display: inline-block;
		min-width: 4.5rem;
		font-size: 0.85rem;
		color: var(--texto-suave);
	}

	.anos {
		display: grid;
		gap: 10px;
	}

	.cartao-ano {
		display: grid;
		gap: 4px;
		width: 100%;
		padding: 12px 14px;
		border: 1px solid var(--linha);
		border-radius: 8px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		text-align: left;
	}

	.cartao-ano:hover {
		border-color: var(--texto-suave);
	}

	.ano {
		font-size: 1.25rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.frase {
		font-size: 0.95rem;
	}

	.acao {
		font-size: 0.85rem;
		color: var(--destaque);
	}
</style>
