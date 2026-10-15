<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import Cabecalho from '#lib/Cabecalho.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { observarRolagem } from '#lib/rolagem.svelte';

	let { children }: { children: Snippet } = $props();

	onMount(observarRolagem);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Cabecalho />

<main>
	{@render children()}
</main>
