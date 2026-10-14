<script>
	import { t } from '#lib/textos.js';

	/** @type {{ chave: string }} */
	let { chave } = $props();
</script>

<aside class="nota">{t(chave)}</aside>

<style>
	.nota {
		margin: 16px 0;
		padding: 12px 14px;
		background: var(--superficie);
		border-left: 4px solid var(--linha);
		color: var(--texto-suave);
		font-size: 0.95rem;
	}
</style>
