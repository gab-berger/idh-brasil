<script>
	import { BLOCOS } from '#lib/navegacao.js';
	import { t } from '#lib/textos.js';
</script>

<nav class="menu" aria-label={t('navegacao.rotulo')}>
	<ul>
		{#each BLOCOS as bloco (bloco.id)}
			<li><a href={`#${bloco.id}`}>{t(bloco.chave)}</a></li>
		{/each}
	</ul>
</nav>

<style>
	.menu {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		z-index: 10;
		height: var(--altura-menu);
		background: var(--fundo);
		border-bottom: 1px solid var(--linha);
	}

	/* Rola de lado dentro do próprio menu, sem empurrar a página. */
	ul {
		display: flex;
		gap: 4px;
		height: 100%;
		margin: 0;
		padding: 0 8px;
		overflow-x: auto;
		list-style: none;
		scrollbar-width: thin;
	}

	a {
		display: flex;
		align-items: center;
		padding: 0 10px;
		color: var(--texto);
		text-decoration: none;
		white-space: nowrap;
		border-bottom: 3px solid transparent;
	}

	a:hover {
		border-bottom-color: var(--linha);
	}
</style>
