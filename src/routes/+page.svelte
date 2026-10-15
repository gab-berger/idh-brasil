<script lang="ts">
	import { resolve } from '$app/paths';
	import Analises from '#lib/Analises.svelte';
	import Estados from '#lib/blocos/Estados.svelte';
	import { t } from '#lib/textos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{t('site.titulo')}</title>
	<meta name="description" content={t('site.resumo')} />
</svelte:head>

<Estados />

<Analises itens={data.analises} />

<!-- Os dados de cada período, e por último o link para a aba Mundo. -->
<details class="nota-pesquisa">
	<summary>{t('tempo.nota.resumo')}</summary>
	<p>{t('nota.troca_pesquisa')}</p>
</details>

<p class="seguir"><a href={resolve('/mundo')}>{t('brasil.ir_mundo')}</a></p>

<style>
	.nota-pesquisa {
		margin-top: 32px;
		font-size: 0.9rem;
		color: var(--texto-suave);
	}

	.nota-pesquisa summary {
		padding: 12px 0;
		cursor: pointer;
	}

	.nota-pesquisa p {
		margin: 0 0 8px;
	}

	.seguir {
		margin: 24px 0 0;
	}

	.seguir a {
		display: inline-flex;
		align-items: center;
		color: var(--destaque);
		font-weight: 600;
	}
</style>
