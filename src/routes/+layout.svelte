<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import Cabecalho from '#lib/Cabecalho.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { t } from '#lib/textos';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Cabecalho />

<main>
	<div class="titulo-site">
		<h1>{t('site.titulo')}</h1>
		<p>{t('site.subtitulo')}</p>
	</div>
	{@render children()}
</main>

<style>
	.titulo-site {
		max-width: var(--largura-texto);
		margin: 0 0 16px;
	}

	.titulo-site p {
		margin: 0;
		font-size: 0.85rem;
		white-space: pre-line;
		color: var(--texto-suave);
	}
</style>
