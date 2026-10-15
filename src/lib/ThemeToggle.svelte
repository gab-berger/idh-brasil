<script lang="ts">
	import { onMount } from 'svelte';
	import { setTheme, syncTheme, theme } from '#lib/theme.svelte';
	import { t } from '#lib/texts';

	onMount(syncTheme);
</script>

<button
	type="button"
	class="theme"
	aria-pressed={theme.dark}
	aria-label={t('theme.dark')}
	title={t('theme.dark')}
	onclick={() => setTheme(!theme.dark)}
>
	<span aria-hidden="true">{theme.dark ? '☀' : '☾'}</span>
</button>

<style>
	.theme {
		position: relative;
		flex: none;
		width: 34px;
		min-width: 34px;
		min-height: 34px;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}

	/* The touch area reaches 44 px, without making the button taller. */
	.theme::after {
		content: '';
		position: absolute;
		inset: -5px;
	}

	.theme[aria-pressed='true'] {
		border-color: var(--accent);
	}
</style>
