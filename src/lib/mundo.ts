/**
 * Aba Mundo: a posição do Brasil no ranking, a leitura da evolução e as linhas da comparação.
 * As funções são puras. O build chama as que leem arquivos (destaque, ranking, evolução); o navegador
 * chama as que montam as linhas do gráfico.
 */
import { faixaIdh } from './escalas';
import { juntar, num, posicao } from './formato';
import { obrigatorio } from './obrigatorio';
import { t, type ChaveTexto } from './textos';
import type { EstiloLinha, LinhaMedia, LinhaPais, LinhaRanking, Pais } from './tipos';

/** Grupos de comparação (médias de países), na ordem da lista de linhas. */
export const GRUPOS = ['mundo', 'africa', 'america_latina_caribe', 'asia', 'europa', 'oceania', 'brics'];

/** Países de comparação, na ordem da lista de linhas. */
export const PAISES = ['RUS', 'IND', 'CHN', 'ZAF', 'USA', 'ARG'];

// A média dos grupos começa em 2000; por isso a evolução compara 2000 e 2023 para todos.
const INICIO = 2000;
const FIM = 2023;

type ComRanking = Pais & { posicao_2023: number; idh_2023: number };

export function ehMedia(chave: string): boolean {
	return GRUPOS.includes(chave);
}

/** Estilo do traço: a quinta linha é sempre pontilhada (D7); antes disso, médias tracejadas e países contínuos. */
export function estiloDaLinha(chave: string, posicaoNaLista: number): EstiloLinha {
	if (posicaoNaLista === 4) return 'dotted';
	return ehMedia(chave) ? 'dashed' : 'solid';
}

/** Nome de uma linha na interface: grupo, país ou o Brasil. Um teste confere que todas as chaves existem. */
export function rotuloDe(chave: string): string {
	return t(`serie.${chave}` as ChaveTexto);
}

/** Pontos de uma linha, em ordem de ano. Médias vêm de medias.json; países, de idh_paises.json. */
export function pontosDe(chave: string, paises: LinhaPais[], medias: LinhaMedia[]): { ano: number; valor: number }[] {
	if (ehMedia(chave)) {
		return medias
			.filter((m) => m.grupo === chave)
			.sort((a, b) => a.ano - b.ano)
			.map((m) => ({ ano: m.ano, valor: m.idh }));
	}
	return paises
		.filter((p) => p.iso3 === chave)
		.sort((a, b) => a.ano - b.ano)
		.map((p) => ({ ano: p.ano, valor: p.idh }));
}

/** Quanto o IDH de uma linha subiu de 2000 a 2023, com as 3 casas dos dados. */
function subiu(chave: string, paises: LinhaPais[], medias: LinhaMedia[]): number | undefined {
	const pontos = pontosDe(chave, paises, medias);
	const ini = pontos.find((p) => p.ano === INICIO);
	const fim = pontos.find((p) => p.ano === FIM);
	if (!ini || !fim) return undefined;
	return Math.round((fim.valor - ini.valor) * 1000) / 1000;
}

/** Responde à pergunta da aba: o Brasil evoluiu mais ou menos que o resto do mundo? Calculado no build. */
export function evolucaoDoBrasil(paises: LinhaPais[], medias: LinhaMedia[]): string {
	const brasil = obrigatorio(subiu('BRA', paises, medias), 'evolução do Brasil');
	const mundo = obrigatorio(subiu('mundo', paises, medias), 'evolução do mundo');
	const diferenca = brasil - mundo;
	// Diferença menor que 0,01 é "quase no mesmo ritmo": os números já mostram a diferença exata.
	const ritmo = Math.abs(diferenca) < 0.01 ? 'ritmo_igual' : diferenca < 0 ? 'ritmo_menos' : 'ritmo_mais';
	const frases = [
		t('mundo.evolucao.texto', {
			ano_ini: INICIO,
			ano_fim: FIM,
			delta_br: num(Math.abs(brasil)),
			delta_mundo: num(Math.abs(mundo)),
			ritmo: t(`mundo.evolucao.${ritmo}`)
		})
	];
	const grupos = GRUPOS.filter((g) => g !== 'mundo').map((g) => ({
		chave: g,
		subiu: obrigatorio(subiu(g, paises, medias), `evolução de ${g}`)
	}));
	const mais = grupos.filter((g) => brasil > g.subiu).map((g) => rotuloDe(g.chave));
	const menos = grupos.filter((g) => brasil < g.subiu).map((g) => rotuloDe(g.chave));
	frases.push(mais.length > 0 ? t('mundo.evolucao.mais', { lista: juntar(mais) }) : t('mundo.evolucao.mais_nenhum'));
	if (menos.length > 0) frases.push(t('mundo.evolucao.menos', { lista: juntar(menos) }));
	return frases.join(' ');
}

function temRanking(pais: Pais): pais is ComRanking {
	return pais.posicao_2023 !== null && pais.idh_2023 !== null;
}

const porNome = (a: Pais, b: Pais): number => a.nome_pt.localeCompare(b.nome_pt, 'pt-BR');

/** Linha de destaque da aba Mundo, no mesmo formato da aba Estado: "IDH global do Brasil em 2023: 0,786 – alto | 84º / 193 países". */
export function destaqueDoBrasil(paises: Pais[]): string {
	const brasil = obrigatorio(
		paises.find((pais) => pais.iso3 === 'BRA'),
		'Brasil no HDR'
	);
	const idh = obrigatorio(brasil.idh_2023, 'IDH do Brasil em 2023');
	const pos = obrigatorio(brasil.posicao_2023, 'posição do Brasil em 2023');
	return t('destaque.mundo', {
		valor: num(idh),
		faixa: t(`faixa.${faixaIdh(idh)}`),
		posicao: posicao(pos),
		total: paises.filter(temRanking).length
	});
}


/** Países perto do Brasil no ranking de 2023: os 3 logo acima, o Brasil com os empatados, os 3 logo abaixo. */
export function vizinhosDoBrasil(paises: Pais[]): LinhaRanking[] {
	const brasil = obrigatorio(
		paises.find((pais) => pais.iso3 === 'BRA'),
		'Brasil no HDR'
	);
	const pos = obrigatorio(brasil.posicao_2023, 'posição do Brasil em 2023');
	const comRanking = paises.filter(temRanking);
	const acima = comRanking
		.filter((p) => p.posicao_2023 < pos)
		.sort((a, b) => b.posicao_2023 - a.posicao_2023 || porNome(a, b))
		.slice(0, 3)
		.sort((a, b) => a.posicao_2023 - b.posicao_2023 || porNome(a, b));
	const empatados = comRanking.filter((p) => p.posicao_2023 === pos).sort(porNome);
	const abaixo = comRanking
		.filter((p) => p.posicao_2023 > pos)
		.sort((a, b) => a.posicao_2023 - b.posicao_2023 || porNome(a, b))
		.slice(0, 3);
	return [...acima, ...empatados, ...abaixo].map((p) => ({
		iso3: p.iso3,
		posicao: p.posicao_2023,
		nome: p.nome_pt,
		idh: p.idh_2023,
		brasil: p.iso3 === 'BRA',
		empate: empatados.length > 1 && p.posicao_2023 === pos
	}));
}
