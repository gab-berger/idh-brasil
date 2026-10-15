<script lang="ts">
	import { geoMercator, geoPath } from 'd3';
	import type { FeatureCollection, Geometry } from 'geojson';
	import { feature } from 'topojson-client';
	import { alternarUf, estado } from '#lib/estado.svelte';
	import { corMapa } from '#lib/escalas';
	import { num, posicao } from '#lib/formato';
	import { posicoes } from '#lib/ranking';
	import { t } from '#lib/textos';
	import type { LinhaUf, MapaTopo, PropsUf } from '#lib/tipos';

	let { topo, linhas }: { topo: MapaTopo; linhas: LinhaUf[] } = $props();

	// Projeção calculada numa largura fixa; o SVG escala para a tela, então nada precisa de medir a janela.
	const LARGURA = 1000;
	// topojson-client tipa o retorno de forma genérica; a malha é sempre uma coleção de UFs (ver tipos.ts).
	const colecao = $derived(feature(topo, topo.objects.estados) as unknown as FeatureCollection<Geometry, PropsUf>);
	const caminho = $derived(geoPath(geoMercator().fitWidth(LARGURA, colecao)));
	const caixa = $derived(caminho.bounds(colecao));
	const larguraCaixa = $derived(caixa[1][0] - caixa[0][0]);
	const alturaCaixa = $derived(caixa[1][1] - caixa[0][1]);

	const cor = $derived(corMapa(estado.medida));
	const porUf = $derived(new Map(linhas.map((linha) => [linha.uf, linha] as const)));
	const pos = $derived(posicoes(linhas, estado.medida));
	const formas = $derived(
		colecao.features.map((f) => ({ uf: f.properties.uf, nome: f.properties.nome, d: caminho(f) ?? '' }))
	);
	const nomeDf = $derived(formas.find((forma) => forma.uf === 'DF')?.nome ?? 'DF');

	/** Pino do DF, que é pequeno demais para tocar no mapa do celular. */
	const pinoDf = $derived.by(() => {
		const df = colecao.features.find((f) => f.properties.uf === 'DF');
		if (!df) return null;
		const [x, y] = caminho.centroid(df);
		return {
			left: `${((x - caixa[0][0]) / larguraCaixa) * 100}%`,
			top: `${((y - caixa[0][1]) / alturaCaixa) * 100}%`
		};
	});

	function valorDe(uf: string): number | undefined {
		return porUf.get(uf)?.[estado.medida];
	}

	function rotulo(uf: string, nome: string): string {
		const valor = valorDe(uf);
		if (valor === undefined) return nome;
		return t('mapa.estado', {
			nome,
			medida: t(`medida.${estado.medida}`),
			valor: num(valor),
			posicao: posicao(pos.get(uf) ?? 0)
		});
	}

	function teclar(evento: KeyboardEvent, uf: string): void {
		if (evento.key === 'Enter' || evento.key === ' ') {
			evento.preventDefault();
			alternarUf(uf);
		}
	}

	const viewBox = $derived(`${caixa[0][0]} ${caixa[0][1]} ${larguraCaixa} ${alturaCaixa}`);
</script>

<div class="mapa">
	<svg {viewBox} role="group" aria-label={t('mapa.rotulo', { medida: t(`medida.${estado.medida}`), ano: estado.ano })}>
		{#each formas as forma (forma.uf)}
			{@const valor = valorDe(forma.uf)}
			<path
				d={forma.d}
				role="button"
				tabindex="0"
				aria-label={rotulo(forma.uf, forma.nome)}
				aria-pressed={estado.ufSelecionada === forma.uf}
				class:selecionada={estado.ufSelecionada === forma.uf}
				style:fill={valor === undefined ? '#cccccc' : cor(valor)}
				onclick={() => alternarUf(forma.uf)}
				onkeydown={(evento) => teclar(evento, forma.uf)}
			/>
		{/each}
	</svg>

	{#if pinoDf}
		<button
			type="button"
			class="pino"
			class:selecionada={estado.ufSelecionada === 'DF'}
			style:left={pinoDf.left}
			style:top={pinoDf.top}
			aria-label={rotulo('DF', nomeDf)}
			aria-pressed={estado.ufSelecionada === 'DF'}
			onclick={() => alternarUf('DF')}
		>
			DF
		</button>
	{/if}
</div>

<style>
	.mapa {
		position: relative;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	path {
		stroke: #ffffff;
		stroke-width: 0.8px;
		vector-effect: non-scaling-stroke;
		cursor: pointer;
		transition: fill 300ms ease;
	}

	path.selecionada {
		stroke: var(--texto);
		stroke-width: 2.5px;
	}

	path:focus-visible {
		outline: none;
		stroke: var(--destaque);
		stroke-width: 3px;
	}

	/* Área de toque de 44 px, com o desenho pequeno no centro. */
	.pino {
		position: absolute;
		transform: translate(-50%, -50%);
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--texto);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
	}

	.pino::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 14px;
		height: 14px;
		transform: translate(-50%, -50%);
		border: 1.5px solid var(--texto);
		border-radius: 50%;
		background: var(--fundo);
	}

	.pino.selecionada::before {
		background: var(--texto);
	}
</style>
