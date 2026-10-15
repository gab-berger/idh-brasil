<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import Cabecalho from '#lib/Cabecalho.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { observarRolagem, rolagem } from '#lib/rolagem.svelte';
	import { t } from '#lib/textos';

	let { children }: { children: Snippet } = $props();

	// A altura do título é medida: a seleção de gráfico (na aba Brasil) fica fixa logo abaixo dele.
	let alturaTitulo = $state(0);

	onMount(observarRolagem);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Cabecalho />

<main style:--altura-titulo={`${alturaTitulo}px`}>
	<div class="titulo-site" class:oculto={rolagem.oculto} bind:clientHeight={alturaTitulo}>
		<div class="texto">
			<h1>{t('site.titulo')}</h1>
			<p>{t('site.subtitulo')}</p>
		</div>
	</div>
	{@render children()}
</main>

<style>
	/* Título e subtítulo ficam fixos logo abaixo do cabeçalho. Como ele, somem ao descer a página e voltam ao subir. */
	.titulo-site {
		position: sticky;
		top: var(--altura-menu);
		z-index: 9;
		margin: 0 calc(-1 * var(--gutter));
		padding: 8px var(--gutter) 12px;
		background: var(--fundo);
		transition: transform 200ms ease;
	}

	.titulo-site.oculto {
		transform: translateY(calc(-100% - var(--altura-menu)));
	}

	.titulo-site.oculto:focus-within {
		transform: none;
	}

	.titulo-site p {
		margin: 0;
		font-size: 0.85rem;
		white-space: pre-line;
		color: var(--texto-suave);
	}
</style>
