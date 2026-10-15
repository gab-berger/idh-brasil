import { ANOS } from './escalas';

const PRIMEIRO = ANOS[0];
const ULTIMO = ANOS[ANOS.length - 1];

/**
 * Posição de um ano na régua, de 0 a 100. A régua é proporcional aos anos: 2010 e 2012 ficam
 * a dois anos de distância, e a troca de pesquisa aparece como um vão.
 */
export function percentualDoAno(ano: number): number {
	return ((ano - PRIMEIRO) / (ULTIMO - PRIMEIRO)) * 100;
}

/** Índice do ano com dado mais próximo de uma fração de 0 a 1 da régua. Empate: o ano menor. */
export function indiceMaisProximo(fracao: number): number {
	const alvo = PRIMEIRO + fracao * (ULTIMO - PRIMEIRO);
	let melhor = 0;
	for (let i = 1; i < ANOS.length; i++) {
		if (Math.abs(ANOS[i] - alvo) < Math.abs(ANOS[melhor] - alvo)) melhor = i;
	}
	return melhor;
}
