<script lang="ts">
	/** Short notice that disappears by itself. A new object for each notice makes it appear again. */
	let { notice = null }: { notice?: { text: string } | null } = $props();

	let visible = $state(false);

	$effect(() => {
		if (!notice) return;
		visible = true;
		const end = setTimeout(() => (visible = false), 4000);
		return () => clearTimeout(end);
	});
</script>

<p class="notice" role="status" aria-live="polite">{visible && notice ? notice.text : ''}</p>

<style>
	.notice {
		min-height: 1.5em;
		margin: 8px 0;
		color: var(--text);
	}
</style>
