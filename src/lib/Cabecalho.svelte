<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ABAS } from '#lib/navegacao';
	import { t } from '#lib/textos';
</script>

<header class="cabecalho">
	<div class="conteudo">
		<a class="marca" href={resolve('/')}>{t('site.titulo')}</a>
		<nav aria-label={t('navegacao.rotulo')}>
			<ul>
				{#each ABAS as aba (aba.rota)}
					<li>
						<a href={resolve(aba.rota)} aria-current={page.route.id === aba.rota ? 'page' : undefined}>
							{t(aba.chave)}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<style>
	.cabecalho {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		z-index: 10;
		height: var(--altura-menu);
		background: var(--fundo);
		border-bottom: 1px solid var(--linha);
	}

	.conteudo {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		height: 100%;
		max-width: var(--largura-visual);
		margin: 0 auto;
		padding: 0 var(--gutter);
	}

	.marca {
		display: flex;
		align-items: center;
		color: var(--texto);
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	nav {
		height: 100%;
	}

	ul {
		display: flex;
		height: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	nav a {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		height: 100%;
		padding: 0 10px;
		border-top: 3px solid transparent;
		border-bottom: 3px solid transparent;
		color: var(--texto);
		text-decoration: none;
		white-space: nowrap;
	}

	nav a:hover {
		border-bottom-color: var(--linha);
	}

	nav a[aria-current='page'] {
		border-bottom-color: var(--destaque);
		font-weight: 600;
	}
</style>
