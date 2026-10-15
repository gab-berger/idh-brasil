<script lang="ts">
	import { t, type TextKey } from '#lib/texts';

	let { key }: { key: TextKey } = $props();
</script>

<aside class="note">{t(key)}</aside>

<style>
	.note {
		margin: 16px 0;
		padding: 12px 14px;
		background: var(--surface);
		border-left: 4px solid var(--line);
		color: var(--text-soft);
		font-size: 0.95rem;
	}
</style>
