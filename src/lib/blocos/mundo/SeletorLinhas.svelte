<script lang="ts">
	import Aviso from '#lib/Aviso.svelte';
	import { alternarLinha, estado } from '#lib/estado.svelte';
	import { estiloDaLinha, GRUPOS, PAISES, rotuloDe } from '#lib/mundo';
	import { t } from '#lib/textos';

	let aviso: { texto: string } | null = $state(null);

	function alternar(chave: string): void {
		if (!alternarLinha(chave)) aviso = { texto: t('comparacao.limite') };
	}

	/** Traço da linha na lista, igual ao do gráfico: a amostra do botão mostra o mesmo desenho. */
	function estiloDoBotao(chave: string): 'solid' | 'dashed' | 'dotted' {
		return estiloDaLinha(chave, Object.keys(estado.linhas).indexOf(chave));
	}
</script>

{#snippet chip(chave: string)}
	{@const ligada = chave in estado.linhas}
	<button type="button" class="chip" aria-pressed={ligada} onclick={() => alternar(chave)}>
		<span
			class="amostra"
			style:border-top-color={ligada ? estado.linhas[chave] : undefined}
			style:border-top-style={ligada ? estiloDoBotao(chave) : undefined}
		></span>
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
		margin-bottom: 12px;
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

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 12px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.9rem;
	}

	.chip[aria-pressed='true'] {
		border-color: var(--texto);
		font-weight: 600;
	}

	.amostra {
		display: block;
		width: 20px;
		border-top: 2px solid var(--linha);
	}
</style>
