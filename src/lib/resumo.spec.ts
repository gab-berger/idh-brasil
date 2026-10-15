import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { textoExtremos, textoResumo } from './resumo';
import { linhaUf, ufsDoAno } from './series';
import type { LinhaUf } from './tipos';

const linhas = JSON.parse(
	readFileSync(new URL('../../dados/prontos/idhm_uf.json', import.meta.url), 'utf-8')
) as LinhaUf[];

test('resumo do Brasil em 2024: o IDHM vem com a faixa; os subíndices, sem', () => {
	const brasil = linhaUf(linhas, 'BR', 2024);
	if (!brasil) throw new Error('Ausente nos dados: Brasil 2024');
	expect(textoResumo(brasil, 'idhm')).toBe('Brasil em 2024: IDHM 0,805, muito alto');
	expect(textoResumo(brasil, 'renda')).toBe('Brasil em 2024: Renda 0,760');
});

test('maior e menor estado em 2024; sem dados, nenhuma frase', () => {
	expect(textoExtremos(ufsDoAno(linhas, 2024), 'idhm')).toBe(
		'Maior IDHM: Distrito Federal, 0,866. Menor: Maranhão, 0,745.'
	);
	expect(textoExtremos([], 'idhm')).toBe('');
});
