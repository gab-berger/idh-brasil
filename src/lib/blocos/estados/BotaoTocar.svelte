<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ANOS } from '#lib/escalas';
	import { estado, irParaAno } from '#lib/estado.svelte';
	import { t } from '#lib/textos';

	const PASSO_MS = 800;
	const ULTIMO = ANOS.length - 1;

	// Um ano a cada PASSO_MS. Se já estiver em 2024, recomeça em 1991. Para ao chegar em 2024.
	$effect(() => {
		if (!estado.tocando) return;
		const id = setInterval(() => {
			const i = ANOS.indexOf(estado.ano);
			if (i >= ULTIMO) {
				estado.tocando = false;
				return;
			}
			irParaAno(ANOS[i + 1]);
		}, PASSO_MS);
		return () => clearInterval(id);
	});

	// Ao trocar de aba, a animação para; não volta tocando sozinha.
	onDestroy(() => {
		estado.tocando = false;
	});

	function tocarOuPausar(): void {
		if (estado.tocando) {
			estado.tocando = false;
			return;
		}
		if (estado.ano === ANOS[ULTIMO]) irParaAno(ANOS[0]);
		estado.tocando = true;
	}
</script>

<svelte:document
	onvisibilitychange={() => {
		if (document.hidden) estado.tocando = false;
	}}
/>

<button type="button" class="tocar" aria-pressed={estado.tocando} onclick={tocarOuPausar}>
	{estado.tocando ? t('tempo.pausar') : t('tempo.tocar')}
</button>

<style>
	/* O botão mais visível da aba: a animação de 1991 a 2024 é o que mais chama a atenção. */
	.tocar {
		flex: none;
		min-height: 44px;
		padding: 0 18px;
		border: 0;
		border-radius: 22px;
		background: var(--destaque);
		color: var(--fundo);
		font: inherit;
		font-weight: 600;
		white-space: nowrap;
		cursor: pointer;
	}

	.tocar[aria-pressed='true'] {
		background: var(--texto);
	}
</style>
