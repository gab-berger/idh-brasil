import { expect, test } from 'vitest';
import { linhaUf, serie, ufsDoAno } from './series';

const linhas = [
	{ uf: 'DF', ano: 2024, idhm: 0.866 },
	{ uf: 'BR', ano: 2024, idhm: 0.805 },
	{ uf: 'DF', ano: 1991, idhm: 0.616 },
	{ uf: 'MA', ano: 2024, idhm: 0.745 }
];

test('serie filtra pelo campo e ordena por ano', () => {
	expect(serie(linhas, 'uf', 'DF').map((linha) => linha.ano)).toEqual([1991, 2024]);
});

test('linhaUf acha a UF no ano, ou undefined se não houver', () => {
	expect(linhaUf(linhas, 'DF', 2024)?.idhm).toBe(0.866);
	expect(linhaUf(linhas, 'MA', 1991)).toBeUndefined();
});

test('ufsDoAno deixa o Brasil de fora', () => {
	expect(ufsDoAno(linhas, 2024).map((linha) => linha.uf)).toEqual(['DF', 'MA']);
});
