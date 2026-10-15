<script lang="ts">
	import { line, scaleLinear } from 'd3';
	import { num, numEixo } from '#lib/formato';
	import { t } from '#lib/textos';
	import type { SerieLinha } from '#lib/tipos';

	let {
		series,
		dominioY,
		anos,
		rotulosX,
		marcador,
		quebra,
		descricao,
		legendaTabela
	}: {
		series: SerieLinha[];
		dominioY: [number, number];
		/** Primeiro e último ano do eixo X. */
		anos: [number, number];
		/** Anos com rótulo no eixo X. */
		rotulosX: number[];
		/** Ano marcado com uma linha vertical (o ano do mapa). */
		marcador?: number;
		/** Ano sem dado (troca de pesquisa): as linhas param antes dele e recomeçam depois. */
		quebra?: number;
		/** Descrição do gráfico para leitores de tela. */
		descricao: string;
		/** Título da tabela de valores, que só leitores de tela leem. */
		legendaTabela: string;
	} = $props();

	type Ponto = SerieLinha['pontos'][number];

	// A largura é medida no navegador; a altura acompanha, dentro de limites, para o gráfico não achatar.
	let largura = $state(0);
	const altura = $derived(Math.round(Math.min(340, Math.max(240, largura * 0.55))));
	// Sem rótulos ao lado das linhas: a legenda fica embaixo, e o gráfico usa a largura toda.
	const MARGEM = { topo: 12, direita: 16, base: 28, esquerda: 40 };

	const x = $derived(
		scaleLinear()
			.domain(anos)
			.range([MARGEM.esquerda, Math.max(MARGEM.esquerda, largura - MARGEM.direita)])
	);
	const y = $derived(scaleLinear().domain(dominioY).range([altura - MARGEM.base, MARGEM.topo]));
	const ticksY = $derived(y.ticks(5));
	const caminho = $derived(
		line<Ponto>()
			.x((p) => x(p.ano))
			.y((p) => y(p.valor))
	);

	// Ano sob o ponteiro (mouse ou dedo). Sem ponteiro, a leitura segue a linha do tempo (o marcador);
	// sem marcador, mostra o último ano.
	let anoFoco: number | null = $state(null);
	const anoLeitura = $derived(anoFoco ?? marcador ?? anos[1]);

	function valorEm(serie: SerieLinha, ano: number): number | undefined {
		return serie.pontos.find((p) => p.ano === ano)?.valor;
	}

	const leitura = $derived(
		series
			.flatMap((serie) => {
				const valor = valorEm(serie, anoLeitura);
				return valor === undefined ? [] : [`${serie.rotulo} ${num(valor)}`];
			})
			.join(' · ')
	);

	function mover(evento: PointerEvent): void {
		const { left } = (evento.currentTarget as SVGSVGElement).getBoundingClientRect();
		const ano = Math.round(x.invert(evento.clientX - left));
		anoFoco = Math.min(anos[1], Math.max(anos[0], ano));
	}

	function sair(): void {
		anoFoco = null;
	}

	/** Trechos de uma série: antes e depois da quebra, para a linha não atravessar o ano sem dado. */
	function trechos(pontos: Ponto[]): Ponto[][] {
		if (quebra === undefined) return [pontos];
		return [pontos.filter((p) => p.ano < quebra), pontos.filter((p) => p.ano > quebra)].filter(
			(trecho) => trecho.length > 0
		);
	}
</script>

<figure class="grafico">
	<div class="area" bind:clientWidth={largura}>
		{#if largura > 0}
			<svg
				width={largura}
				height={altura}
				role="img"
				aria-label={descricao}
				onpointermove={mover}
				onpointerleave={sair}
			>
				{#each ticksY as valor (valor)}
					<line class="grade" x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(valor)} y2={y(valor)} />
					<text class="eixo" x={MARGEM.esquerda - 6} y={y(valor)} dy="0.32em" text-anchor="end">{numEixo(valor)}</text>
				{/each}
				{#each rotulosX as ano (ano)}
					<text class="eixo" x={x(ano)} y={altura - 8} text-anchor="middle">{ano}</text>
				{/each}
				{#if quebra !== undefined}
					<line class="quebra" x1={x(quebra)} x2={x(quebra)} y1={MARGEM.topo} y2={altura - MARGEM.base} />
				{/if}
				{#if marcador !== undefined}
					<line class="marcador" x1={x(marcador)} x2={x(marcador)} y1={MARGEM.topo} y2={altura - MARGEM.base} />
				{/if}
				{#if anoFoco !== null}
					<line class="guia" x1={x(anoLeitura)} x2={x(anoLeitura)} y1={MARGEM.topo} y2={altura - MARGEM.base} />
				{/if}
				{#each series as serie (serie.chave)}
					{#each trechos(serie.pontos) as trecho, i (i)}
						<path
							class="linha"
							d={caminho(trecho) ?? ''}
							stroke={serie.cor}
							stroke-width={serie.espessura ?? 2}
							stroke-dasharray={serie.traco}
						/>
					{/each}
				{/each}
				{#if anoFoco !== null}
					{#each series as serie (serie.chave)}
						{@const valor = valorEm(serie, anoLeitura)}
						{#if valor !== undefined}
							<circle class="ponto" cx={x(anoLeitura)} cy={y(valor)} r="4" fill={serie.cor} />
						{/if}
					{/each}
				{/if}
			</svg>
		{/if}
	</div>

	<!-- A legenda das linhas fica embaixo do gráfico, e a leitura dos valores embaixo dela. -->
	<ul class="legenda">
		{#each series as serie (serie.chave)}
			<li>
				<svg width="22" height="8" aria-hidden="true">
					<line
						x1="1"
						x2="21"
						y1="4"
						y2="4"
						stroke={serie.cor}
						stroke-width={serie.espessura ?? 2}
						stroke-dasharray={serie.traco}
					/>
				</svg>
				{serie.rotulo}
			</li>
		{/each}
	</ul>

	<p class="leitura" aria-hidden="true">{t('grafico.leitura', { ano: anoLeitura, valores: leitura })}</p>

	<table class="sr-only">
		<caption>{legendaTabela}</caption>
		<thead>
			<tr>
				<td></td>
				{#each rotulosX as ano (ano)}
					<th scope="col">{ano}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each series as serie (serie.chave)}
				<tr>
					<th scope="row">{serie.rotulo}</th>
					{#each rotulosX as ano (ano)}
						{@const valor = valorEm(serie, ano)}
						<td>{valor === undefined ? '' : num(valor)}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</figure>

<style>
	.grafico {
		margin: 0;
	}

	.area svg {
		display: block;
		overflow: visible;
		/* O dedo rola a página na vertical; na horizontal, percorre os anos. */
		touch-action: pan-y;
	}

	.legenda {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 16px;
		margin: 8px 0 0;
		padding: 0;
		list-style: none;
		font-size: 0.9rem;
	}

	.legenda li {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legenda svg {
		flex: none;
	}

	.leitura {
		min-height: 1.5em;
		margin: 6px 0 0;
		font-size: 0.9rem;
		color: var(--texto-suave);
		font-variant-numeric: tabular-nums;
	}

	.grade {
		stroke: var(--linha);
		stroke-width: 1;
	}

	.eixo {
		fill: var(--texto-suave);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}

	.quebra {
		stroke: var(--texto-suave);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}

	.marcador,
	.guia {
		stroke: var(--texto);
		stroke-width: 1;
		opacity: 0.35;
	}

	.linha {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.ponto {
		stroke: var(--fundo);
		stroke-width: 1.5;
	}
</style>
