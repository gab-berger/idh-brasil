<script lang="ts">
	import { MEDIDAS } from '#lib/escalas';
	import { estado } from '#lib/estado.svelte';
	import { t } from '#lib/textos';
</script>

<div class="seletor" role="group" aria-label={t('medida.rotulo')}>
	{#each MEDIDAS as medida (medida)}
		<button type="button" aria-pressed={estado.medida === medida} onclick={() => (estado.medida = medida)}>
			{t(`medida.${medida}`)}
		</button>
	{/each}
</div>

<style>
	/* Mesmo desenho das sub-abas: o escolhido é um bloco azul inteiro. */
	.seletor {
		display: flex;
		gap: 6px;
		margin: 0 0 12px;
	}

	button {
		flex: 1 1 auto;
		position: relative;
		min-height: 34px;
		padding: 0 6px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	button[aria-pressed='true'] {
		border-color: var(--destaque);
		background: var(--destaque);
		color: var(--fundo);
		font-weight: 600;
	}
</style>
