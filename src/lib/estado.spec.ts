import { expect, test } from 'vitest';
import { CORES_LINHAS } from './escalas';
import { alternarLinha, alternarUf, definirDaltonismo, estado, irParaAno } from './estado.svelte';

test('abre com mundo, BRICS, EUA e China, nessa ordem, e sem UF selecionada', () => {
	expect(Object.keys(estado.linhas)).toEqual(['mundo', 'brics', 'USA', 'CHN']);
	expect(estado.ano).toBe(2024);
	expect(estado.medida).toBe('idhm');
	expect(estado.ufSelecionada).toBeNull();
});

test('a sexta linha é bloqueada', () => {
	expect(alternarLinha('ARG')).toBe(true);
	expect(alternarLinha('RUS')).toBe(false);
	expect(Object.keys(estado.linhas)).toHaveLength(5);
});

test('desligar uma linha não muda a cor das outras; a nova pega a cor livre', () => {
	const corBrics = estado.linhas.brics;
	alternarLinha('mundo');
	expect(estado.linhas.brics).toBe(corBrics);
	expect(alternarLinha('RUS')).toBe(true);
	expect(estado.linhas.RUS).toBe(CORES_LINHAS[0]);
});

test('irParaAno aceita só anos com dado', () => {
	irParaAno(2010);
	expect(estado.ano).toBe(2010);
	expect(() => irParaAno(2011)).toThrow('Ano sem dado');
});

test('alternarUf marca e desmarca a mesma UF', () => {
	alternarUf('DF');
	expect(estado.ufSelecionada).toBe('DF');
	alternarUf('DF');
	expect(estado.ufSelecionada).toBeNull();
});

test('a paleta para daltônicos vem desligada, e liga e desliga', () => {
	expect(estado.daltonismo).toBe(false);
	definirDaltonismo(true);
	expect(estado.daltonismo).toBe(true);
	definirDaltonismo(false);
	expect(estado.daltonismo).toBe(false);
});
