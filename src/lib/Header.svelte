<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { TABS } from '#lib/navigation';
	import ThemeToggle from '#lib/ThemeToggle.svelte';
	import { scroll } from '#lib/scroll.svelte';
	import { t } from '#lib/texts';
</script>

<header class="header" class:hidden={scroll.hidden}>
	<div class="content">
		<a class="brand" href={resolve('/')}>{t('site.brand')}</a>
		<nav aria-label={t('nav.label')}>
			<ul>
				{#each TABS as tab (tab.route)}
					<li>
						<a href={resolve(tab.route)} aria-current={page.route.id === tab.route ? 'page' : undefined}>
							{t(tab.key)}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<ThemeToggle />
	</div>
</header>

<style>
	.header {
		box-sizing: border-box;
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		z-index: 10;
		height: var(--header-height);
		background: var(--background);
		border-bottom: 1px solid var(--line);
		transition: transform 200ms ease;
	}

	/* When the page scrolls down, the header leaves the screen; when it scrolls up, it comes back. With focus inside, it stays visible. */
	.header.hidden {
		transform: translateY(-100%);
	}

	.header.hidden:focus-within {
		transform: none;
	}

	.content {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 12px;
		height: 100%;
		max-width: var(--visual-width);
		margin: 0 auto;
		padding: 0 var(--gutter);
	}

	.brand {
		display: flex;
		flex: none;
		align-items: center;
		height: 100%;
		color: var(--text);
		font-size: 0.95rem;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	/* 44 px touch targets in a 40 px header: the extra area lives in a pseudo-element. */
	.brand,
	nav a {
		position: relative;
		min-height: 0;
	}

	.brand::after,
	nav a::after {
		content: '';
		position: absolute;
		inset: -3px 0;
	}

	/* On a phone the brand goes: the page title right below says the same, and the three tabs and the theme button fit. */
	@media (max-width: 480px) {
		.brand {
			display: none;
		}

		.content {
			gap: 8px;
		}

		nav a {
			padding: 0 2px;
			font-size: 0.85rem;
		}
	}

	/* The tabs share the free width, instead of being grouped on the right. */
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
		color: var(--text-soft);
		font-size: 0.9rem;
		text-decoration: none;
		white-space: nowrap;
	}

	nav a:hover {
		border-bottom-color: var(--line);
		color: var(--text);
	}

	nav a[aria-current='page'] {
		border-bottom-color: var(--accent);
		color: var(--text);
		font-weight: 600;
	}
</style>
