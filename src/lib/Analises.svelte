<script lang="ts">
	import { onMount } from 'svelte';
	import { irParaVista } from '#lib/estado.svelte';
	import { t } from '#lib/textos';
	import type { Analise } from '#lib/tipos';

	let { itens, titulo = t('analises.titulo') }: { itens: Analise[]; titulo?: string } = $props();

	// Uma análise por vez, girando sozinha. Para quando o mouse ou o foco estão dentro, quando a pessoa
	// pausa, e não gira para quem pediu menos movimento no sistema (WCAG 2.2.2).
	const INTERVALO_MS = 10000;

	let atual = $state(0);
	let pausado = $state(false);
	let dentro = $state(false);
	let montado = $state(false);
	let semMovimento = $state(false);

	onMount(() => {
		montado = true;
		semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const girando = $derived(montado && !pausado && !dentro && !semMovimento && itens.length > 1);

	$effect(() => {
		if (!girando) return;
		const id = setInterval(() => (atual = (atual + 1) % itens.length), INTERVALO_MS);
		return () => clearInterval(id);
	});

	function ir(passo: number): void {
		atual = (atual + passo + itens.length) % itens.length;
	}

	/** Leva o mapa (ou o gráfico das regiões) à vista da análise e rola até lá. */
	function ver(item: Analise): void {
		if (!item.acao) return;
		irParaVista(item.acao);
		const alvo = 'estados';
		document.getElementById(alvo)?.scrollIntoView({ behavior: semMovimento ? 'auto' : 'smooth' });
	}

	function sairDoFoco(evento: FocusEvent): void {
		const caixa = evento.currentTarget as HTMLElement;
		if (!caixa.contains(evento.relatedTarget as Node | null)) dentro = false;
	}
</script>

<section
	class="analises"
	aria-labelledby="analises-titulo"
	aria-roledescription="carrossel"
	onpointerenter={() => (dentro = true)}
	onpointerleave={() => (dentro = false)}
	onfocusin={() => (dentro = true)}
	onfocusout={sairDoFoco}
>
	<h2 id="analises-titulo">{titulo}</h2>

	<!-- Sem JavaScript, as análises aparecem uma embaixo da outra; os controles só existem depois de montar. -->
	{#if montado && itens.length > 1}
		<div class="controles">
			{#if !semMovimento}
				<button type="button" aria-pressed={pausado} onclick={() => (pausado = !pausado)}>
					{pausado ? t('analises.continuar') : t('analises.pausar')}
				</button>
			{/if}
			<button type="button" onclick={() => ir(-1)}>{t('analises.anterior')}</button>
			<span class="posicao" aria-hidden="true">{t('analises.posicao', { n: atual + 1, total: itens.length })}</span>
			<button type="button" onclick={() => ir(1)}>{t('analises.proxima')}</button>
		</div>
	{/if}

	<div class="itens" aria-live={girando ? 'off' : 'polite'}>
		{#each itens as item, i (item.id)}
			<div
				class="analise"
				role="group"
				aria-roledescription="slide"
				aria-label={t('analises.posicao', { n: i + 1, total: itens.length })}
				hidden={montado && i !== atual}
			>
				<h3>{item.titulo}</h3>
				{#each item.texto.split('\n') as paragrafo}
					<p>{paragrafo}</p>
				{/each}
				{#if montado && item.acao}
					<button type="button" class="ver" onclick={() => ver(item)}>{item.acao.rotulo}</button>
				{/if}
			</div>
		{/each}
	</div>
</section>

<style>
	.controles {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-bottom: 12px;
	}

	.controles button {
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

	.controles button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.posicao {
		min-width: 3.5rem;
		color: var(--texto-suave);
		font-size: 0.9rem;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}

	.analise {
		max-width: var(--largura-texto);
		padding: 4px 0 4px 16px;
		border-left: 4px solid var(--destaque);
	}

	.analise + .analise {
		margin-top: 16px;
	}

	h3 {
		margin: 0 0 6px;
		font-size: 1.1rem;
	}

	.analise p {
		margin: 0;
	}

	.ver::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.ver {
		margin-top: 10px;
		position: relative;
		min-height: 34px;
		padding: 0 14px;
		border: 1px solid var(--destaque);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--destaque);
		font: inherit;
		font-weight: 600;
	}
</style>
