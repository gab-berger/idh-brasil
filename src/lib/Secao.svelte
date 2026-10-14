<script>
	/** @type {{ id: string, titulo: string, children?: import('svelte').Snippet }} */
	let { id, titulo, children } = $props();
</script>

<section {id} class="secao" aria-labelledby={`${id}-titulo`}>
	<h2 id={`${id}-titulo`}>{titulo}</h2>
	{@render children?.()}
</section>

<style>
	/* A seção para abaixo do menu fixo quando a pessoa toca no link. */
	.secao {
		scroll-margin-top: calc(var(--altura-menu) + 8px);
	}
</style>
