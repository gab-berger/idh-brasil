import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { analisesDoBrasil } from './analises';
import type { LinhaRegiao, LinhaUf } from './tipos';

// Cada análise é conferida, número a número, contra os dados prontos.
function ler<T>(nome: string): T {
	return JSON.parse(readFileSync(new URL(`../../dados/prontos/${nome}`, import.meta.url), 'utf-8')) as T;
}

const analises = analisesDoBrasil(ler<LinhaUf[]>('idhm_uf.json'), ler<LinhaRegiao[]>('regioes.json'));

function analise(id: string) {
	const encontrada = analises.find((a) => a.id === id);
	if (!encontrada) throw new Error(`Sem a análise ${id}`);
	return encontrada;
}

test('quatro análises, a das regiões primeiro (é a pergunta da aba)', () => {
	expect(analises.map((a) => a.id)).toEqual(['regioes', 'estados', 'avanco', 'dimensoes']);
});

test('regiões: o Nordeste foi a que mais avançou, e a diferença entre as regiões caiu', () => {
	expect(analise('regioes').texto).toBe(
		'O Nordeste: a média dos seus estados foi de 0,393 em 1991 para 0,761 em 2024 (+0,368). A diferença entre a região mais alta e a mais baixa caiu de 0,140 para 0,063.'
	);
	expect(analise('regioes').acao?.alvo).toBe('regioes');
});

test('estados: a distância entre o maior e o menor caiu de 0,259 para 0,121', () => {
	expect(analise('estados').texto).toBe(
		'Em 1991, a distância entre o maior e o menor IDHM estadual era de 0,259 (Distrito Federal, 0,616; Maranhão, 0,357). Em 2024, caiu para 0,121 (Distrito Federal, 0,866; Maranhão, 0,745).'
	);
	expect(analise('estados').acao).toEqual({
		rotulo: 'Ver 1991 no mapa',
		alvo: 'mapa',
		medida: 'idhm',
		ano: 1991,
		uf: null
	});
});

test('avanço: os cinco que mais avançaram e os três que menos avançaram', () => {
	expect(analise('avanco').texto).toBe(
		'De 1991 a 2024: Tocantins (+0,428), Piauí (+0,402), Maranhão (+0,388), Rondônia (+0,379) e Paraíba (+0,378). Os que menos avançaram foram Rio de Janeiro (+0,246), Distrito Federal (+0,250) e São Paulo (+0,260).'
	);
	expect(analise('avanco').acao?.uf).toBe('TO');
});

test('dimensões: a Educação puxou o avanço do Brasil', () => {
	expect(analise('dimensoes').texto).toBe(
		'Educação: o subíndice do Brasil foi de 0,279 em 1991 para 0,798 em 2024 (+0,519). No mesmo período, Longevidade subiu 0,198 e Renda subiu 0,113.'
	);
	expect(analise('dimensoes').acao?.medida).toBe('educacao');
});
