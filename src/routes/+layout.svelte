<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import Cabecalho from '#lib/Cabecalho.svelte';
	import favicon from '#lib/assets/favicon.svg';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Cabecalho />

<main>
	{@render children()}
</main>
