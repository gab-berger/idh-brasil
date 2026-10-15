<script lang="ts" generics="T extends string">
	import { rolagem } from '#lib/rolagem.svelte';

	/** Sub-abas ("Forma de ver"): escolhas em bloco, fixas logo abaixo do cabeçalho de abas. */
	let {
		opcoes,
		atual,
		aoEscolher,
		rotulo
	}: {
		opcoes: { chave: T; rotulo: string }[];
		atual: T;
		aoEscolher: (chave: T) => void;
		rotulo: string;
	} = $props();
</script>

<div class="subabas" class:oculto={rolagem.oculto} role="group" aria-label={rotulo}>
	{#each opcoes as opcao (opcao.chave)}
		<button type="button" aria-pressed={atual === opcao.chave} onclick={() => aoEscolher(opcao.chave)}>
			{opcao.rotulo}
		</button>
	{/each}
</div>

<style>
	/* Fixas abaixo do cabeçalho. Ao descer, somem junto com ele; ao subir, voltam. */
	.subabas {
		position: sticky;
		top: var(--altura-menu);
		z-index: 8;
		display: flex;
		box-sizing: border-box;
		align-items: center;
		gap: 6px;
		height: var(--altura-abas);
		margin: 0 calc(-1 * var(--gutter));
		padding: 8px var(--gutter);
		border-bottom: 1px solid var(--linha);
		background: var(--fundo);
		transition: transform 200ms ease;
	}

	.subabas.oculto {
		transform: translateY(calc(-100% - var(--altura-menu)));
	}

	.subabas.oculto:focus-within {
		transform: none;
	}

	.subabas button {
		flex: 1 1 auto;
		position: relative;
		min-height: 34px;
		padding: 0 8px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.9rem;
	}

	/* A área de toque chega a 44 px, sem deixar o botão mais alto. */
	.subabas button::after {
		content: '';
		position: absolute;
		inset: -5px 0;
	}

	.subabas button[aria-pressed='true'] {
		border-color: var(--destaque);
		background: var(--destaque);
		color: var(--fundo);
		font-weight: 600;
	}
</style>
