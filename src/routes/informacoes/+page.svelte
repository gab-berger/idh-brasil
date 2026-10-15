<script lang="ts">
	import { dataBr } from '#lib/formato';
	import { t, type ChaveTexto } from '#lib/textos';
	import type { Dimensao } from '#lib/tipos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Cada dimensão tem o texto do IDHM (estados) e o do IDH global (países), como na especificação.
	const DIMENSOES: { medida: Dimensao; idhm: ChaveTexto; idh: ChaveTexto }[] = [
		{ medida: 'longevidade', idhm: 'oque.longevidade.idhm', idh: 'oque.longevidade.idh' },
		{ medida: 'educacao', idhm: 'oque.educacao.idhm', idh: 'oque.educacao.idh' },
		{ medida: 'renda', idhm: 'oque.renda.idhm', idh: 'oque.renda.idh' }
	];
</script>

<svelte:head>
	<title>{t('abas.informacoes')} · {t('site.titulo')}</title>
	<meta name="description" content={t('entenda.subtitulo')} />
</svelte:head>

<div class="texto">
	<h2 class="pagina">{t('entenda.titulo')}</h2>
	<p class="subtitulo">{t('entenda.subtitulo')}</p>

	<!-- Perguntas que abrem e fecham: dá para ler só os títulos e abrir o que interessa. -->
	<details open>
		<summary><h2>{t('entenda.p.oque')}</h2></summary>
		<p>{t('oque.definicao')}</p>
	</details>

	<details>
		<summary><h2>{t('entenda.p.dimensoes')}</h2></summary>
		{#each DIMENSOES as dimensao (dimensao.medida)}
			<section class="dimensao">
				<h3>{t(`medida.${dimensao.medida}`)}</h3>
				<dl>
					<dt>{t('oque.dimensoes.idhm')}</dt>
					<dd>{t(dimensao.idhm)}</dd>
					<dt>{t('oque.dimensoes.idh')}</dt>
					<dd>{t(dimensao.idh)}</dd>
				</dl>
			</section>
		{/each}
	</details>

	<details>
		<summary><h2>{t('entenda.p.media')}</h2></summary>
		<p><strong>{t('oque.media_geometrica.titulo')}</strong> {t('oque.media_geometrica')}</p>
	</details>

	<details>
		<summary><h2>{t('entenda.p.faixas')}</h2></summary>
		<p>{t('oque.faixas.idhm')}</p>
		<p>{t('oque.faixas.idh')}</p>
	</details>

	<details>
		<summary><h2>{t('entenda.p.reguas')}</h2></summary>
		<p><strong>{t('oque.quadro.titulo')}</strong></p>
		<p>{t('nota.idhm_vs_idh')}</p>
	</details>

	<details>
		<summary><h2>{t('entenda.p.quebra')}</h2></summary>
		<p>{t('nota.troca_pesquisa')}</p>
	</details>

	<details>
		<summary><h2>{t('entenda.p.medias')}</h2></summary>
		<p>{t('entenda.medias.regioes')}</p>
		<p>{t('nota.medias')}</p>
	</details>

	<details>
		<summary><h2>{t('entenda.p.ranking')}</h2></summary>
		<p>{t('nota.ranking')}</p>
	</details>

	<details>
		<summary><h2>{t('entenda.p.brics')}</h2></summary>
		<p>{t('nota.brics')}</p>
	</details>

	<details>
		<summary><h2>{t('entenda.p.fontes')}</h2></summary>
		<ul class="fontes">
			{#each data.fontes as fonte (fonte.id)}
				<li>
					<a href={fonte.url}>{fonte.nome}</a>.
					{t('entenda.fonte', { edicao: fonte.edicao, licenca: fonte.licenca, data: dataBr(fonte.data_acesso) })}
				</li>
			{/each}
		</ul>
		<p class="creditos">{t('creditos')}</p>
	</details>
</div>

<style>
	.pagina {
		margin: 0 0 8px;
	}

	details {
		border-bottom: 1px solid var(--linha);
	}

	summary {
		padding: 10px 0;
		cursor: pointer;
	}

	summary h2 {
		display: inline;
		margin: 0;
		font-size: 1.1rem;
	}

	details > :not(summary) {
		margin-top: 0;
	}

	details[open] {
		padding-bottom: 12px;
	}

	.dimensao {
		margin: 0 0 12px;
	}

	h3 {
		margin: 0 0 4px;
		font-size: 1rem;
	}

	dl {
		display: grid;
		gap: 4px 10px;
		margin: 0;
	}

	dt {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--texto-suave);
	}

	dd {
		margin: 0 0 6px;
	}

	.fontes {
		margin: 0 0 12px;
		padding-left: 20px;
	}

	.fontes li {
		margin-bottom: 8px;
	}

	.fontes a {
		color: var(--destaque);
	}

	.creditos {
		font-size: 0.9rem;
		color: var(--texto-suave);
	}
</style>
