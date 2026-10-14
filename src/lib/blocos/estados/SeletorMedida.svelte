<script>
	import { MEDIDAS } from '#lib/escalas.js';
	import { estado } from '#lib/estado.svelte.js';
	import { t } from '#lib/textos.js';
</script>

<div class="seletor" role="group" aria-label={t('medida.rotulo')}>
	{#each MEDIDAS as medida (medida)}
		<button type="button" aria-pressed={estado.medida === medida} onclick={() => (estado.medida = medida)}>
			{t(`medida.${medida}`)}
		</button>
	{/each}
</div>

<style>
	/* No celular, duas colunas: "Longevidade" não cabe em um quarto da largura. */
	.seletor {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px;
	}

	@media (min-width: 480px) {
		.seletor {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	button {
		min-height: 44px;
		padding: 0 4px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.9rem;
	}

	button[aria-pressed='true'] {
		border-color: var(--texto);
		font-weight: 600;
	}
</style>
