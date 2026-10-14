import { expect, test } from 'vitest';
import { posicoes } from './ranking.js';
import { indiceMaisProximo, percentualDoAno } from './tempo.js';

test('posição: 1 é o maior, e empates dividem a posição', () => {
	const linhas = [
		{ uf: 'A', idhm: 0.8 },
		{ uf: 'B', idhm: 0.7 },
		{ uf: 'C', idhm: 0.7 },
		{ uf: 'D', idhm: 0.6 }
	];
	const pos = posicoes(linhas, 'idhm');
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
