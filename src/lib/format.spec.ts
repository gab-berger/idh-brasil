import { expect, test } from 'vitest';
import { delta, num, position } from './format';

test('values with three decimals and a decimal comma', () => {
	expect(num(0.805)).toBe('0,805');
	expect(num(0.357)).toBe('0,357');
});

test('change with a sign; a negative uses the typographic minus', () => {
	expect(delta(0.428)).toBe('+0,428');
	expect(delta(-0.01)).toBe('−0,010');
});

test('position with the ordinal indicator', () => {
	expect(position(84)).toBe('84º');
});
