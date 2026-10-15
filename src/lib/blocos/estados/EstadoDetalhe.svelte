<script lang="ts">
	import { CORES_DIMENSAO, faixaIdhm } from '#lib/escalas';
	import { estado } from '#lib/estado.svelte';
	import { num, posicao } from '#lib/formato';
	import Linhas from '#lib/graficos/Linhas.svelte';
	import { posicoes } from '#lib/ranking';
	import { serie } from '#lib/series';
	import { t } from '#lib/textos';
	import type { LinhaUf, Medida, SerieLinha } from '#lib/tipos';

	// uf: as linhas do estado em todos os anos (para o gráfico); linhas: as do ano da linha do tempo (para o destaque).
	let { uf, linhas }: { uf: LinhaUf[]; linhas: LinhaUf[] } = $props();

	// Os quatro indicadores. O IDHM é a linha preta, mais grossa; os subíndices usam as cores das dimensões.
	const MEDIDAS: Medida[] = ['idhm', 'longevidade', 'educacao', 'renda'];
	const COR: Record<Medida, string> = {
		idhm: '#000000',
		longevidade: CORES_DIMENSAO.longevidade,
		educacao: CORES_DIMENSAO.educacao,
		renda: CORES_DIMENSAO.renda
	};
	const DOMINIO_Y: [number, number] = [0.1, 1];
	const ANOS: [number, number] = [1991, 2024];
	const ROTULOS_X = [1991, 2000, 2010, 2024];

	const linha = $derived(linhas.find((l) => l.uf === estado.ufSelecionada));
	const pos = $derived(posicoes(linhas, 'idhm'));
	const historico = $derived(estado.ufSelecionada ? serie(uf, 'uf', estado.ufSelecionada) : []);
	const series = $derived(
		MEDIDAS.map(
			(medida): SerieLinha => ({
				chave: medida,
				rotulo: t(`medida.${medida}`),
				cor: COR[medida],
				espessura: medida === 'idhm' ? 3 : 2,
				pontos: historico.map((l) => ({ ano: l.ano, valor: l[medida] }))
			})
		)
	);
	const destaque = $derived(
		linha
			? t('estado.destaque', {
					valor: num(linha.idhm),
					faixa: t(`faixa.${faixaIdhm(linha.idhm)}`),
					posicao: posicao(pos.get(linha.uf) ?? 0)
				})
			: ''
	);
</script>

{#if linha}
	<section class="detalhe" aria-labelledby="detalhe-titulo">
		<h3 id="detalhe-titulo">{linha.nome}</h3>
		<p class="destaque">{destaque}</p>
		<Linhas
			{series}
			dominioY={DOMINIO_Y}
			anos={ANOS}
			rotulosX={ROTULOS_X}
			marcador={estado.ano}
			quebra={2011}
			descricao={t('detalhe.grafico', { nome: linha.nome })}
			legendaTabela={t('detalhe.tabela', { nome: linha.nome })}
		/>
		<p class="fonte">
			{t('gaveta.fonte', { fonte: linha.fonte === 'Censo' ? t('fonte.censo') : t('fonte.pnad'), ano: linha.ano })}
		</p>
	</section>
{/if}

<style>
	h3 {
		margin: 0;
		font-size: 1.1rem;
	}

	.destaque {
		margin: 4px 0 12px;
		text-align: center;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.fonte {
		margin: 8px 0 0;
		font-size: 0.8rem;
		color: var(--texto-suave);
	}
</style>
