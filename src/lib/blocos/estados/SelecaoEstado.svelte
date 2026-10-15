<script lang="ts">
	import { estado } from '#lib/estado.svelte';
	import { num } from '#lib/formato';
	import { t } from '#lib/textos';
	import type { LinhaUf } from '#lib/tipos';

	let { linhas }: { linhas: LinhaUf[] } = $props();

	// Estado escolhido no mapa ou no ranking: a linha leva à aba Estado, onde estão os detalhes.
	const linha = $derived(linhas.find((l) => l.uf === estado.ufSelecionada));
</script>

{#if linha}
	<div class="selecao">
		<p>
			{t('selecao.resumo', {
				nome: linha.nome,
				medida: t(`medida.${estado.medida}`),
				valor: num(linha[estado.medida])
			})}
		</p>
		<button type="button" onclick={() => (estado.subaba = 'estado')}>{t('selecao.ver')}</button>
	</div>
{/if}

<style>
	.selecao {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 12px;
		margin: 12px 0;
		padding: 8px 12px;
		border-left: 4px solid var(--destaque);
		background: var(--superficie);
	}

	.selecao p {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.selecao button {
		min-height: 44px;
		padding: 0 14px;
		border: 1px solid var(--destaque);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--destaque);
		font: inherit;
		font-weight: 600;
	}
</style>
