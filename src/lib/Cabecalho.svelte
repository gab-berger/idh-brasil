<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ABAS } from '#lib/navegacao';
	import { rolagem } from '#lib/rolagem.svelte';
	import { t } from '#lib/textos';
</script>

<header class="cabecalho" class:oculto={rolagem.oculto}>
	<div class="conteudo">
		<a class="marca" href={resolve('/')}>{t('site.marca')}</a>
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
		box-sizing: border-box;
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		z-index: 10;
		height: var(--altura-menu);
		background: var(--fundo);
		border-bottom: 1px solid var(--linha);
		transition: transform 200ms ease;
	}

	/* Ao descer a página, o cabeçalho sai da tela; ao subir, volta. Com o foco dentro dele, fica visível. */
	.cabecalho.oculto {
		transform: translateY(-100%);
	}

	.cabecalho.oculto:focus-within {
		transform: none;
	}

	.conteudo {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 12px;
		height: 100%;
		max-width: var(--largura-visual);
		margin: 0 auto;
		padding: 0 var(--gutter);
	}

	.marca {
		display: flex;
		flex: none;
		align-items: center;
		height: 100%;
		color: var(--texto);
		font-size: 0.95rem;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	/* Alvos de toque de 44 px num cabeçalho de 40 px: a área extra fica num pseudo-elemento. */
	.marca,
	nav a {
		position: relative;
		min-height: 0;
	}

	.marca::after,
	nav a::after {
		content: '';
		position: absolute;
		inset: -3px 0;
	}

	/* As abas dividem a largura que sobra, em vez de ficarem agrupadas à direita. */
	nav {
		flex: 1;
		height: 100%;
		min-width: 0;
	}

	ul {
		display: flex;
		height: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		flex: 1 1 0;
		min-width: 0;
	}

	nav a {
		box-sizing: border-box;
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 0 6px;
		border-top: 3px solid transparent;
		border-bottom: 3px solid transparent;
		color: var(--texto-suave);
		font-size: 0.9rem;
		text-decoration: none;
		white-space: nowrap;
	}

	nav a:hover {
		border-bottom-color: var(--linha);
		color: var(--texto);
	}

	nav a[aria-current='page'] {
		border-bottom-color: var(--destaque);
		color: var(--texto);
		font-weight: 600;
	}
</style>
