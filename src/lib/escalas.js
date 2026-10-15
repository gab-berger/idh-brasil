/**
 * Escalas, faixas e cores da interface. Os valores vêm da especificação
 * (especificação, em Design visual e Regras de dados); nada aqui é lido dos dados.
 */
import { interpolateYlGnBu, scaleSequential } from 'd3';

/** Anos com dado: Censo em 1991, 2000 e 2010; PNAD Contínua de 2012 a 2024. Não há 2011. */
export const ANOS = [1991, 2000, 2010, ...Array.from({ length: 13 }, (_, i) => 2012 + i)];

/** @typedef {'idhm' | 'longevidade' | 'educacao' | 'renda'} Medida */
export const MEDIDAS = /** @type {const} */ (['idhm', 'longevidade', 'educacao', 'renda']);

/** Domínio fixo de cada medida: do menor ao maior valor da série inteira (1991 a 2024). */
/** @type {Record<Medida, [number, number]>} */
export const DOMINIOS = {
	idhm: [0.35, 0.9],
	educacao: [0.15, 0.9],
	longevidade: [0.55, 0.95],
	renda: [0.45, 0.9]
};

/**
 * Faixas do IDHM: muito baixo (0 a 0,499), baixo (0,500 a 0,599), médio (0,600 a 0,699),
 * alto (0,700 a 0,799), muito alto (0,800 a 1).
 * @param {number} valor
 * @returns {'muito_baixo' | 'baixo' | 'medio' | 'alto' | 'muito_alto'}
 */
export function faixaIdhm(valor) {
	if (valor < 0.5) return 'muito_baixo';
	if (valor < 0.6) return 'baixo';
	if (valor < 0.7) return 'medio';
	if (valor < 0.8) return 'alto';
	return 'muito_alto';
}

/**
 * Faixas do IDH global: baixo (abaixo de 0,550), médio (0,550 a 0,699), alto (0,700 a 0,799),
 * muito alto (0,800 ou mais). Não são as faixas do IDHM.
 * @param {number} valor
 * @returns {'baixo' | 'medio' | 'alto' | 'muito_alto'}
 */
export function faixaIdh(valor) {
	if (valor < 0.55) return 'baixo';
	if (valor < 0.7) return 'medio';
	if (valor < 0.8) return 'alto';
	return 'muito_alto';
}

/**
 * Escala de cor de uma medida: contínua e igual em todos os anos (YlGnBu, segura para daltônicos).
 * @param {Medida} medida
 */
export function corMapa(medida) {
	return scaleSequential(DOMINIOS[medida], interpolateYlGnBu).clamp(true);
}

/**
 * Posição de um valor dentro do domínio de uma medida: 0 no mínimo, 1 no máximo.
 * Usada para comprimento de barras, então a diferença entre estados fica visível.
 * @param {number} valor
 * @param {[number, number]} dominio
 */
export function posicaoNoDominio(valor, dominio) {
	const [minimo, maximo] = dominio;
	return Math.min(1, Math.max(0, (valor - minimo) / (maximo - minimo)));
}

/** Cor do Brasil em todos os gráficos de linha. */
export const COR_BRASIL = '#D55E00';

/** Cores das linhas da comparação, por posição livre. Cada linha mantém a cor até ser desligada. */
export const CORES_LINHAS = ['#000000', '#0072B2', '#009E73', '#CC79A7', '#A86F00'];

/** Máximo de linhas ligadas ao mesmo tempo, além do Brasil. */
export const MAX_LINHAS = CORES_LINHAS.length;

/** Cores das três dimensões nos gráficos de subíndices. */
export const CORES_DIMENSAO = { longevidade: '#009E73', educacao: '#0072B2', renda: '#CC79A7' };
