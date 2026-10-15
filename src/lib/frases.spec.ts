import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { frasesDosAnos } from './frases';
import type { LinhaUf } from './tipos';

// As frases dos anos são conferidas contra as da especificação e contra os dados prontos.
const linhas = JSON.parse(
	readFileSync(new URL('../../dados/prontos/idhm_uf.json', import.meta.url), 'utf-8')
) as LinhaUf[];

test('frases dos três anos, iguais às da especificação', () => {
	expect(frasesDosAnos(linhas)).toEqual({
		1991: '20 dos 27 estados estavam na faixa muito baixa; o maior IDHM era o do DF, 0,616.',
		2010: 'Nenhum estado ficou abaixo de 0,600; o DF era o único acima de 0,800.',
		2024: 'Todos os estados estão nas faixas alta ou muito alta; 10 passam de 0,800.'
	});
});
