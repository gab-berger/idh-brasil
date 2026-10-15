import { expect, test } from 'vitest';
import { posicoes } from './ranking';
import { indiceMaisProximo, percentualDoAno } from './tempo';

/** Uma linha com as quatro medidas, que é o que `posicoes` exige. */
const linha = (uf: string, idhm: number) => ({ uf, idhm, educacao: 0, longevidade: 0, renda: 0 });

test('posição: 1 é o maior, e empates dividem a posição', () => {
	const pos = posicoes([linha('A', 0.8), linha('B', 0.7), linha('C', 0.7), linha('D', 0.6)], 'idhm');
	expect([pos.get('A'), pos.get('B'), pos.get('C'), pos.get('D')]).toEqual([1, 2, 2, 4]);
});

test('a régua vai de 0 a 100 e é proporcional aos anos', () => {
	expect(percentualDoAno(1991)).toBe(0);
	expect(percentualDoAno(2024)).toBe(100);
	expect(percentualDoAno(2000)).toBeCloseTo((9 / 33) * 100);
});

test('posição da régua escolhe o ano com dado mais próximo', () => {
	expect(indiceMaisProximo(0)).toBe(0);
	expect(indiceMaisProximo(1)).toBe(15);
	// 2010,4 está mais perto de 2010 do que de 2012
	expect(indiceMaisProximo((2010.4 - 1991) / 33)).toBe(2);
	// 2011,4 está mais perto de 2012 do que de 2010; 2011 não existe
	expect(indiceMaisProximo((2011.4 - 1991) / 33)).toBe(3);
});
