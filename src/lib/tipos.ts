import type { GeometryCollection, Topology } from 'topojson-specification';

/** Medidas do IDHM e dos subíndices. */
export type Medida = 'idhm' | 'longevidade' | 'educacao' | 'renda';

/** Os três subíndices. */
export type Dimensao = 'longevidade' | 'educacao' | 'renda';

/** Faixas do IDHM (ver escalas.ts). */
export type FaixaIdhm = 'muito_baixo' | 'baixo' | 'medio' | 'alto' | 'muito_alto';

/** Faixas do IDH global (ver escalas.ts). */
export type FaixaIdh = 'baixo' | 'medio' | 'alto' | 'muito_alto';

/** Forma de ver os estados. */
export type Vista = 'mapa' | 'ranking';

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
