<script lang="ts">
	import Aviso from '#lib/Aviso.svelte';
	import { alternarLinha, estado } from '#lib/estado.svelte';
	import { GRUPOS, PAISES, rotuloDe } from '#lib/mundo';
	import { t } from '#lib/textos';

	let aviso: { texto: string } | null = $state(null);

	function alternar(chave: string): void {
		if (!alternarLinha(chave)) aviso = { texto: t('comparacao.limite') };
	}
</script>

{#snippet chip(chave: string)}
	<button type="button" class="chip" aria-pressed={chave in estado.linhas} onclick={() => alternar(chave)}>
		{rotuloDe(chave)}
	</button>
{/snippet}

<div class="selecao" role="group" aria-label={t('mundo.selecao.rotulo')}>
	<div class="grupo">
		<h3>{t('mundo.selecao.medias')}</h3>
		<div class="chips">
			{#each GRUPOS as chave (chave)}
				{@render chip(chave)}
			{/each}
		</div>
	</div>
	<div class="grupo">
		<h3>{t('mundo.selecao.paises')}</h3>
		<div class="chips">
			{#each PAISES as chave (chave)}
				{@render chip(chave)}
			{/each}
		</div>
	</div>
</div>

<Aviso {aviso} />

<style>
	.selecao {
		display: grid;
		gap: 8px;
		margin-bottom: 8px;
	}

	.grupo {
		display: grid;
		gap: 6px;
	}

	h3 {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--texto-suave);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	/* Mesmo desenho das sub-abas e das medidas: a escolhida é um bloco azul. A cor de cada linha fica no fim dela, no gráfico. */
	.chip {
		position: relative;
		min-height: 34px;
		padding: 0 10px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.875rem;
	}

	.chip::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.chip[aria-pressed='true'] {
		border-color: var(--destaque);
		background: var(--destaque);
		color: var(--fundo);
		font-weight: 600;
	}
</style>
