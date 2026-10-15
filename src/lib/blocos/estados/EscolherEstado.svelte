<script lang="ts">
	import { estado } from '#lib/estado.svelte';
	import { t } from '#lib/textos';
	import type { LinhaUf } from '#lib/tipos';

	let { linhas }: { linhas: LinhaUf[] } = $props();

	// Em ordem alfabética: o jeito mais rápido de achar um estado pequeno no mapa, como o DF ou Sergipe.
	const opcoes = $derived([...linhas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
</script>

<label class="escolher">
	<span>{t('escolher.rotulo')}</span>
	<select
		value={estado.ufSelecionada ?? ''}
		onchange={(evento) => (estado.ufSelecionada = evento.currentTarget.value || null)}
	>
		<option value="">{t('escolher.nenhum')}</option>
		{#each opcoes as linha (linha.uf)}
			<option value={linha.uf}>{linha.nome}</option>
		{/each}
	</select>
</label>

<style>
	.escolher {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 12px;
		margin: 8px 0;
	}

	select {
		flex: 1 1 200px;
		max-width: 320px;
		min-height: 44px;
		padding: 0 8px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
	}
</style>
