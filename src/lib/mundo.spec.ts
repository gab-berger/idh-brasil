import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { destaqueDoBrasil, estiloDaLinha, evolucaoDoBrasil, GRUPOS, PAISES, rankingDoAno, rotuloDe } from './mundo';
import type { LinhaMedia, LinhaPais, Pais, RankingAnos } from './tipos';

// Os números da aba Mundo são conferidos contra os arquivos de dados prontos.
const ler = <T>(nome: string): T =>
	JSON.parse(readFileSync(new URL(`../../dados/prontos/${nome}`, import.meta.url), 'utf-8')) as T;
const paises = ler<Pais[]>('paises.json');
const linhasPais = ler<LinhaPais[]>('idh_paises.json');
const medias = ler<LinhaMedia[]>('medias.json');
const ranking = ler<RankingAnos>('ranking_anos.json');

test('destaque de 2023: IDH 0,786, alto, em 84º de 193 países', () => {
	expect(destaqueDoBrasil(paises)).toBe('IDH global do Brasil em 2023: 0,786 – alto | 84º / 193 países');
});

test('ranking de 2023: 193 países, 63 deles empatados; o Brasil e Palau dividem o 84º', () => {
	const linhas = rankingDoAno(ranking, 2023);
	expect(linhas).toHaveLength(193);
	expect(linhas.filter((l) => l.posicao === 84).map((l) => l.nome)).toEqual(['Brasil', 'Palau']);
	expect(linhas.filter((l) => l.empate)).toHaveLength(63);
	expect(linhas.find((l) => l.brasil)).toMatchObject({ posicao: 84, idh: 0.786, empate: true });
});

test('o ranking de 2023 recalculado com os valores brutos bate com as posições oficiais do HDR', () => {
	const linhas = rankingDoAno(ranking, 2023);
	for (const pais of paises.filter((p) => p.posicao_2023 !== null)) {
		expect(linhas.find((l) => l.iso3 === pais.iso3)?.posicao).toBe(pais.posicao_2023);
	}
});

test('em 1990, só entram os países com dado: 141, na ordem da posição', () => {
	const linhas = rankingDoAno(ranking, 1990);
	expect(linhas).toHaveLength(141);
	const posicoes = linhas.map((l) => l.posicao);
	expect(posicoes).toEqual([...posicoes].sort((a, b) => a - b));
});

test('evolução de 2000 a 2023: o Brasil subiu quase no mesmo ritmo que o mundo', () => {
	expect(evolucaoDoBrasil(linhasPais, medias)).toBe(
		'Entre 2000 e 2023, o IDH do Brasil subiu 0,096 e a média dos países subiu 0,105. Ou seja, o Brasil evoluiu quase no mesmo ritmo que o resto do mundo. O Brasil subiu mais que América Latina e Caribe, Europa e Oceania. Subiu menos que África, Ásia e BRICS.'
	);
});

test('estilo das linhas: médias tracejadas, países contínuos, a quinta pontilhada', () => {
	expect(estiloDaLinha('mundo', 0)).toBe('dashed');
	expect(estiloDaLinha('CHN', 2)).toBe('solid');
	expect(estiloDaLinha('RUS', 4)).toBe('dotted');
});

test('todas as linhas têm nome na interface', () => {
	for (const chave of [...GRUPOS, ...PAISES, 'BRA']) {
		expect(rotuloDe(chave).length).toBeGreaterThan(0);
	}
});
