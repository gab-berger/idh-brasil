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
	/* Uma linha só: cada botão toma a largura do próprio texto, e o espaço sobrante é dividido. */
	.seletor {
		display: flex;
		gap: 4px;
	}

	button {
		flex: 1 1 auto;
		min-height: 44px;
		padding: 0 6px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	button[aria-pressed='true'] {
		border-color: var(--texto);
		font-weight: 600;
	}
</style>
