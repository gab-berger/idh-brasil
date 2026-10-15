<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import Header from '#lib/Header.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { watchScroll } from '#lib/scroll.svelte';

	let { children }: { children: Snippet } = $props();

	onMount(watchScroll);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header />

<main>
	{@render children()}
</main>
