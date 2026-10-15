<script lang="ts">
	import type { ChaveTexto } from '#lib/textos';
	import { t } from '#lib/textos';
	import type { Dimensao } from '#lib/tipos';

	// Cada dimensão tem o texto do IDHM (estados) e o do IDH global (países), como na especificação.
	const DIMENSOES: { medida: Dimensao; idhm: ChaveTexto; idh: ChaveTexto }[] = [
		{ medida: 'longevidade', idhm: 'oque.longevidade.idhm', idh: 'oque.longevidade.idh' },
		{ medida: 'educacao', idhm: 'oque.educacao.idhm', idh: 'oque.educacao.idh' },
		{ medida: 'renda', idhm: 'oque.renda.idhm', idh: 'oque.renda.idh' }
	];
</script>

<p>{t('oque.definicao')}</p>

<h3>{t('oque.dimensoes.titulo')}</h3>
{#each DIMENSOES as dimensao (dimensao.medida)}
	<section class="dimensao">
		<h4>{t(`medida.${dimensao.medida}`)}</h4>
		<dl>
			<dt>{t('oque.dimensoes.idhm')}</dt>
			<dd>{t(dimensao.idhm)}</dd>
			<dt>{t('oque.dimensoes.idh')}</dt>
			<dd>{t(dimensao.idh)}</dd>
		</dl>
	</section>
{/each}

<p><strong>{t('oque.media_geometrica.titulo')}</strong> {t('oque.media_geometrica')}</p>

<h3>{t('oque.faixas.titulo')}</h3>
<p>{t('oque.faixas.idhm')}</p>
<p>{t('oque.faixas.idh')}</p>

<aside class="quadro">
	<h3>{t('oque.quadro.titulo')}</h3>
	<p>{t('nota.idhm_vs_idh')}</p>
</aside>

<style>
	h3 {
		margin: 24px 0 8px;
		font-size: 1.1rem;
	}

	.dimensao {
		margin: 0 0 12px;
		padding: 12px 14px;
		border: 1px solid var(--linha);
		border-radius: 8px;
	}

	h4 {
		margin: 0 0 6px;
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

	.quadro {
		margin: 20px 0 0;
		padding: 12px 14px;
		border-left: 4px solid var(--destaque);
		background: var(--superficie);
	}

	.quadro h3 {
		margin: 0 0 6px;
	}

	.quadro p {
		margin: 0;
	}
</style>
