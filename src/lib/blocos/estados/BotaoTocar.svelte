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

<button
	type="button"
	class="tocar"
	aria-pressed={estado.tocando}
	aria-label={estado.tocando ? t('tempo.pausar') : t('tempo.tocar')}
	title={estado.tocando ? t('tempo.pausar') : t('tempo.tocar')}
	onclick={tocarOuPausar}
>
	<span aria-hidden="true">{estado.tocando ? '❚❚' : '▶'}</span>
</button>

<style>
	/* Botão redondo e pequeno: o desenho tem 44 px, a área de toque também. */
	.tocar {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 1px solid var(--destaque);
		border-radius: 50%;
		background: var(--fundo);
		color: var(--destaque);
		font-size: 0.8rem;
		cursor: pointer;
	}

	.tocar[aria-pressed='true'] {
		border-color: var(--texto);
		color: var(--texto);
	}
</style>
