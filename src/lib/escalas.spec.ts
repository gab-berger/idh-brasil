import { readFileSync } from 'node:fs';
import { interpolateRdYlBu, interpolateYlGnBu, rgb } from 'd3';
import { expect, test } from 'vitest';
import {
	ANOS,
	COR_BRASIL,
	CORES_DIMENSAO,
	CORES_LINHAS,
	CORES_REGIOES,
	corMapa,
	DOMINIOS,
	faixaIdh,
	faixaIdhm,
	posicaoNoDominio
} from './escalas';
import type { LinhaUf, Medida } from './tipos';

const dadosUf = JSON.parse(
	readFileSync(new URL('../../dados/prontos/idhm_uf.json', import.meta.url), 'utf-8')
) as LinhaUf[];

/** Contraste WCAG de uma cor #RRGGBB sobre fundo branco. */
function contrasteNoBranco(hex: string): number {
	const canais = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
	const [r, g, b] = canais.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	const luminancia = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return 1.05 / (luminancia + 0.05);
}

test('faixas do IDHM nas bordas', () => {
	expect(faixaIdhm(0.499)).toBe('muito_baixo');
	expect(faixaIdhm(0.5)).toBe('baixo');
	expect(faixaIdhm(0.599)).toBe('baixo');
	expect(faixaIdhm(0.6)).toBe('medio');
	expect(faixaIdhm(0.699)).toBe('medio');
	expect(faixaIdhm(0.7)).toBe('alto');
	expect(faixaIdhm(0.799)).toBe('alto');
	expect(faixaIdhm(0.8)).toBe('muito_alto');
});

test('faixas do IDH global nas bordas', () => {
	expect(faixaIdh(0.549)).toBe('baixo');
	expect(faixaIdh(0.55)).toBe('medio');
	expect(faixaIdh(0.699)).toBe('medio');
	expect(faixaIdh(0.7)).toBe('alto');
	expect(faixaIdh(0.799)).toBe('alto');
	expect(faixaIdh(0.8)).toBe('muito_alto');
});

test('as duas escalas separam o Brasil em faixas diferentes', () => {
	// IDHM 2024 = 0,805 (muito alto) e IDH global 2023 = 0,786 (alto): o ponto delicado da especificação.
	expect(faixaIdhm(0.805)).toBe('muito_alto');
	expect(faixaIdh(0.786)).toBe('alto');
});

test('16 anos com dado: sem 2011, com 2010 e 2012', () => {
	expect(ANOS).toHaveLength(16);
	expect(ANOS).not.toContain(2011);
	expect(ANOS).toContain(2010);
	expect(ANOS).toContain(2012);
	expect(ANOS[0]).toBe(1991);
	expect(ANOS[ANOS.length - 1]).toBe(2024);
});

test('os domínios fixos cobrem todos os valores da série', () => {
	for (const [medida, [minimo, maximo]] of Object.entries(DOMINIOS) as [Medida, [number, number]][]) {
		const valores = dadosUf.map((linha) => linha[medida]);
		expect(Math.min(...valores)).toBeGreaterThanOrEqual(minimo);
		expect(Math.max(...valores)).toBeLessThanOrEqual(maximo);
	}
});

test('a paleta padrão vai do vermelho (menor valor) ao azul (maior valor), e fica presa nas bordas', () => {
	expect(corMapa('idhm')(0.35)).toBe(interpolateRdYlBu(0));
	expect(corMapa('idhm')(0.9)).toBe(interpolateRdYlBu(1));
	expect(corMapa('idhm')(0.2)).toBe(interpolateRdYlBu(0));
	const baixo = rgb(corMapa('idhm')(0.35));
	const alto = rgb(corMapa('idhm')(0.9));
	expect(baixo.r).toBeGreaterThan(baixo.b);
	expect(alto.b).toBeGreaterThan(alto.r);
});

test('a paleta para daltônicos é amarelo, verde e azul, e troca a cor do mapa', () => {
	expect(corMapa('idhm', true)(0.35)).toBe(interpolateYlGnBu(0));
	expect(corMapa('idhm', true)(0.9)).toBe(interpolateYlGnBu(1));
	expect(corMapa('idhm', true)(0.9)).not.toBe(corMapa('idhm')(0.9));
});

test('cada cor de linha, de dimensão e de região tem contraste de 3:1 ou mais sobre branco', () => {
	const cores = [
		COR_BRASIL,
		...CORES_LINHAS,
		...Object.values(CORES_DIMENSAO),
		...Object.values(CORES_REGIOES).map((regiao) => regiao.cor)
	];
	for (const cor of cores) {
		expect(contrasteNoBranco(cor)).toBeGreaterThanOrEqual(3);
	}
});

test('posição no domínio: 0 no mínimo, 1 no máximo, e nunca fora de 0 a 1', () => {
	expect(posicaoNoDominio(0.35, DOMINIOS.idhm)).toBe(0);
	expect(posicaoNoDominio(0.9, DOMINIOS.idhm)).toBe(1);
	expect(posicaoNoDominio(0.625, DOMINIOS.idhm)).toBeCloseTo(0.5);
	expect(posicaoNoDominio(0.2, DOMINIOS.idhm)).toBe(0);
	expect(posicaoNoDominio(1, DOMINIOS.idhm)).toBe(1);
});
