<script lang="ts">
	/** Aviso curto que some sozinho. Um objeto novo a cada aviso faz ele aparecer de novo. */
	let { aviso = null }: { aviso?: { texto: string } | null } = $props();

	let visivel = $state(false);

	$effect(() => {
		if (!aviso) return;
		visivel = true;
		const fim = setTimeout(() => (visivel = false), 4000);
		return () => clearTimeout(fim);
	});
</script>

<p class="aviso" role="status" aria-live="polite">{visivel && aviso ? aviso.texto : ''}</p>

<style>
	.aviso {
		min-height: 1.5em;
		margin: 8px 0;
		color: var(--texto);
	}
</style>
