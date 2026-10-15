<script lang="ts">
	import { t, type ChaveTexto } from '#lib/textos';

	let { chave }: { chave: ChaveTexto } = $props();
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
