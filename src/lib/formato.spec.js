import { expect, test } from 'vitest';
import { delta, num, posicao } from './formato.js';

test('valores com três casas decimais e vírgula', () => {
	expect(num(0.805)).toBe('0,805');
	expect(num(0.357)).toBe('0,357');
});

test('variação com sinal; negativo com o sinal de menos tipográfico', () => {
	expect(delta(0.428)).toBe('+0,428');
	expect(delta(-0.01)).toBe('−0,010');
});

test('posição com indicador ordinal', () => {
	expect(posicao(84)).toBe('84º');
});
