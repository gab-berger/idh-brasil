<script lang="ts">
	import { corMapa, DOMINIOS } from '#lib/escalas';
	import { estado } from '#lib/estado.svelte';
	import { num } from '#lib/formato';
	import { t } from '#lib/textos';

	// Cortes do IDHM, marcados na escala (as faixas em si ficam na gaveta de cada estado).
	const CORTES_IDHM: number[] = [0.5, 0.6, 0.7, 0.8];

	const dominio = $derived(DOMINIOS[estado.medida]);
	const cor = $derived(corMapa(estado.medida, estado.daltonismo));
	const gradiente = $derived.by(() => {
		const [minimo, maximo] = dominio;
		const degraus = Array.from({ length: 11 }, (_, i) => minimo + ((maximo - minimo) * i) / 10);
		return `linear-gradient(to right, ${degraus.map((v) => cor(v)).join(', ')})`;
	});

	function posicaoNaEscala(valor: number): string {
		const [minimo, maximo] = dominio;
		return `${((valor - minimo) / (maximo - minimo)) * 100}%`;
	}
</script>

<div class="legenda">
	<div class="barra" style:background={gradiente} role="img" aria-label={t('legenda.rotulo')}></div>

	<div class="rotulos">
		<span class="ponta" style:left="0%">{num(dominio[0])}</span>
		{#if estado.medida === 'idhm'}
			{#each CORTES_IDHM as corte (corte)}
				<span class="corte" style:left={posicaoNaEscala(corte)}>{num(corte)}</span>
			{/each}
		{/if}
		<span class="ponta" style:left="100%">{num(dominio[1])}</span>
	</div>
</div>

<style>
	.legenda {
		margin: 12px 0 4px;
		padding: 0 4px;
	}

	.barra {
		height: 14px;
		border-radius: 4px;
	}

	.rotulos {
		position: relative;
		height: 1.5rem;
		margin-top: 4px;
		font-size: 0.8rem;
		color: var(--texto-suave);
	}

	.rotulos span {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.rotulos .ponta:first-child {
		transform: none;
	}

	.rotulos .ponta:last-child {
		transform: translateX(-100%);
	}
</style>
