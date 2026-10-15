import type { GeometryCollection, Topology } from 'topojson-specification';

/** Medidas do IDHM e dos subíndices. */
export type Medida = 'idhm' | 'longevidade' | 'educacao' | 'renda';

/** Os três subíndices. */
export type Dimensao = 'longevidade' | 'educacao' | 'renda';

/** Faixas do IDHM (ver escalas.ts). */
export type FaixaIdhm = 'muito_baixo' | 'baixo' | 'medio' | 'alto' | 'muito_alto';

/** Faixas do IDH global (ver escalas.ts). */
export type FaixaIdh = 'baixo' | 'medio' | 'alto' | 'muito_alto';

/** Sub-abas da aba Brasil: o mapa, o ranking ou a evolução das regiões. */
export type Subaba = 'mapa' | 'ranking' | 'regioes';

/** Uma linha de idhm_uf.json: uma UF num ano ("BR" é o Brasil). */
export interface LinhaUf {
	uf: string;
	nome: string;
	ano: number;
	/** "Censo" até 2010; "PNAD Contínua" de 2012 em diante. */
	fonte: string;
	idhm: number;
	educacao: number;
	longevidade: number;
	renda: number;
}

/** As cinco regiões do Brasil, pela sigla. */
export type SiglaRegiao = 'N' | 'NE' | 'CO' | 'SE' | 'S';

/** Uma linha de regioes.json: a média simples dos estados de uma região, num ano. */
export interface LinhaRegiao {
	regiao: SiglaRegiao;
	nome: string;
	ano: number;
	idhm: number;
	educacao: number;
	longevidade: number;
	renda: number;
	n_estados: number;
}

/** O que uma análise faz quando a pessoa pede para ver: muda o mapa e rola até o alvo. */
export interface Acao {
	rotulo: string;
	alvo: Subaba;
	medida?: Medida;
	ano?: number;
	/** null desmarca a UF; ausente não mexe nela. */
	uf?: string | null;
}

/** Uma análise pronta, calculada no build. */
export interface Analise {
	id: string;
	titulo: string;
	texto: string;
	acao?: Acao;
}

/** Uma série do gráfico de linhas. */
export interface SerieLinha {
	chave: string;
	rotulo: string;
	cor: string;
	/** stroke-dasharray do SVG; ausente = linha contínua. */
	traco?: string;
	espessura?: number;
	pontos: { ano: number; valor: number }[];
}

/** Uma linha de idh_paises.json: um dos países da comparação, num ano. */
export interface LinhaPais {
	iso3: string;
	ano: number;
	idh: number;
	esperanca_vida: number;
	anos_esperados: number;
	media_anos_estudo: number;
	renda_pc: number;
}

/** Um país de paises.json. Posição e IDH de 2023 são null nos dois países sem ranking. */
export interface Pais {
	iso3: string;
	nome_pt: string;
	regiao: string;
	brics_original: boolean;
	serie_desde_1990: boolean;
	serie_desde_2000: boolean;
	posicao_2023: number | null;
	idh_2023: number | null;
}

/** Uma linha de medias.json: a média de um grupo num ano. */
export interface LinhaMedia {
	grupo: string;
	ano: number;
	idh: number;
	n_paises: number;
}

/** Estilo do traço: contínuo para países, tracejado para médias; a quinta linha é sempre pontilhada (D7). */
export type EstiloLinha = 'solid' | 'dashed' | 'dotted';

/** Uma linha do ranking mundial perto do Brasil. Empatados têm a mesma posição e `empate` marcado. */
export interface LinhaRanking {
	iso3: string;
	posicao: number;
	nome: string;
	idh: number;
	brasil: boolean;
	empate: boolean;
}

/** Uma entrada de fontes.json. */
export interface Fonte {
	id: string;
	nome: string;
	edicao: string;
	url: string;
	licenca: string;
	data_acesso: string;
}

/** Propriedades de cada UF na malha (br_uf.topojson). */
export interface PropsUf {
	cod: string;
	uf: string;
	nome: string;
}

/** Malha das UFs: um objeto "estados" com uma geometria por UF. */
export type MapaTopo = Topology<{ estados: GeometryCollection<PropsUf> }>;
