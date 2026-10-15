import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { numerosAbertura } from './abertura';
import type { LinhaUf, Pais } from './tipos';

// Os cartões de abertura são conferidos contra as frases da especificação e contra os dados prontos.
const linhas = JSON.parse(
	readFileSync(new URL('../../dados/prontos/idhm_uf.json', import.meta.url), 'utf-8')
) as LinhaUf[];
const paises = JSON.parse(
	readFileSync(new URL('../../dados/prontos/paises.json', import.meta.url), 'utf-8')
) as Pais[];
const abertura = numerosAbertura(linhas, paises);

test('cartão do IDHM: 0,805, faixa muito alta', () => {
	expect(abertura.idhm).toEqual({ valor: '0,805', faixa: 'muito alto' });
});

test('extremos de 2024: Distrito Federal 0,866 (maior) e Maranhão 0,745 (menor)', () => {
	expect(abertura.extremos.maior).toEqual({ nome: 'Distrito Federal', valor: '0,866' });
	expect(abertura.extremos.menor).toEqual({ nome: 'Maranhão', valor: '0,745' });
});

test('posição no mundo: 84º, IDH 0,786, empatado com Palau', () => {
	expect(abertura.mundo).toEqual({ posicao: '84º', detalhe: 'IDH 0,786, empatado com Palau' });
});

test('frases dos três anos, iguais às da especificação', () => {
	expect(abertura.anos.map((item) => item.frase)).toEqual([
		'20 dos 27 estados estavam na faixa muito baixa; o maior IDHM era o do DF, 0,616.',
		'Nenhum estado ficou abaixo de 0,600; o DF era o único acima de 0,800.',
		'Todos os estados estão nas faixas alta ou muito alta; 10 passam de 0,800.'
	]);
});
