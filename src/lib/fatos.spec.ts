import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { linhaUf, serie, ufsDoAno } from './series';
import type { LinhaUf } from './tipos';

// Os números dos cartões de abertura e dos destaques vêm da especificação (documento de apoio, fora do repositório).
// Este teste confere cada um contra o arquivo de dados, para que nada saia errado para a tela.
const uf = JSON.parse(
	readFileSync(new URL('../../dados/prontos/idhm_uf.json', import.meta.url), 'utf-8')
) as LinhaUf[];

/** Valor que o teste exige: falha com mensagem se estiver ausente. */
function exigir<T>(valor: T | undefined, descricao: string): T {
	if (valor === undefined) throw new Error(`Ausente nos dados: ${descricao}`);
	return valor;
}

test('cartão de 2024: Brasil 0,805; DF 0,866 (maior); Maranhão 0,745 (menor)', () => {
	expect(exigir(linhaUf(uf, 'BR', 2024), 'Brasil 2024').idhm).toBe(0.805);
	const estados2024 = ufsDoAno(uf, 2024).sort((a, b) => b.idhm - a.idhm);
	expect(estados2024[0].uf).toBe('DF');
	expect(estados2024[0].idhm).toBe(0.866);
	expect(estados2024[estados2024.length - 1].uf).toBe('MA');
	expect(estados2024[estados2024.length - 1].idhm).toBe(0.745);
});

test('cartão de 2024: todos os estados em alto ou muito alto; 10 acima de 0,800', () => {
	const estados2024 = ufsDoAno(uf, 2024);
	expect(estados2024.every((l) => l.idhm >= 0.7)).toBe(true);
	expect(estados2024.filter((l) => l.idhm >= 0.8)).toHaveLength(10);
});

test('cartão de 1991: 20 estados em muito baixo; o maior é o DF, 0,616', () => {
	const estados1991 = ufsDoAno(uf, 1991);
	expect(estados1991.filter((l) => l.idhm < 0.5)).toHaveLength(20);
	const maior = estados1991.reduce((a, b) => (b.idhm > a.idhm ? b : a));
	expect(maior.uf).toBe('DF');
	expect(maior.idhm).toBe(0.616);
});

test('cartão de 2010: nenhum estado abaixo de 0,600; só o DF acima de 0,800', () => {
	const estados2010 = ufsDoAno(uf, 2010);
	expect(estados2010.every((l) => l.idhm >= 0.6)).toBe(true);
	const acima = estados2010.filter((l) => l.idhm > 0.8);
	expect(acima.map((l) => l.uf)).toEqual(['DF']);
});

test('Maranhão em 1991 = 0,357 (valor de referência da checagem)', () => {
	expect(exigir(linhaUf(uf, 'MA', 1991), 'Maranhão 1991').idhm).toBe(0.357);
});

test('quem mais subiu de 1991 a 2024: TO, PI, MA, RO, PB, nessa ordem', () => {
	const ganhos = ufsDoAno(uf, 2024).map((fim) => {
		const ini = exigir(linhaUf(uf, fim.uf, 1991), `${fim.uf} 1991`);
		return { uf: fim.uf, ganho: Math.round((fim.idhm - ini.idhm) * 1000) / 1000 };
	});
	ganhos.sort((a, b) => b.ganho - a.ganho);
	expect(ganhos.slice(0, 5).map((g) => g.uf)).toEqual(['TO', 'PI', 'MA', 'RO', 'PB']);
	expect(ganhos[0].ganho).toBe(0.428);
	expect(ganhos[4].ganho).toBe(0.378);
});

test('Brasil: Educação foi a dimensão que mais subiu, de 0,279 para 0,798', () => {
	const serieBr = serie(uf, 'uf', 'BR');
	const ini = exigir(serieBr[0], 'Brasil, primeiro ano');
	const fim = exigir(serieBr[serieBr.length - 1], 'Brasil, último ano');
	expect(ini.ano).toBe(1991);
	expect(fim.ano).toBe(2024);
	expect(ini.educacao).toBe(0.279);
	expect(fim.educacao).toBe(0.798);
});
