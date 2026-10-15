<script lang="ts">
	import { t } from '#lib/textos';
</script>

<div class="titulo-site texto">
	<h1>{t('site.titulo')}</h1>
	<p>{t('site.subtitulo')}</p>
</div>

<style>
	/* Título e subtítulo vêm logo abaixo da seleção de gráfico. Não ficam fixos: rolam com a página. */
	.titulo-site {
		margin: 16px 0 12px;
	}

	p {
		margin: 0;
		font-size: 0.85rem;
		white-space: pre-line;
		color: var(--texto-suave);
	}
</style>
