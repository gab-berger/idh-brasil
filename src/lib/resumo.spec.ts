import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { textoResumo } from './resumo';
import { linhaUf } from './series';
import type { LinhaUf } from './tipos';

const linhas = JSON.parse(
	readFileSync(new URL('../../dados/prontos/idhm_uf.json', import.meta.url), 'utf-8')
) as LinhaUf[];

test('destaque do Brasil em 2024: o IDH com a classificação; os subíndices só com o valor', () => {
	const brasil = linhaUf(linhas, 'BR', 2024);
	if (!brasil) throw new Error('Ausente nos dados: Brasil 2024');
	expect(textoResumo(brasil, 'idhm')).toBe('IDH Brasil: 0,805 – muito alto');
	expect(textoResumo(brasil, 'renda')).toBe('Renda Brasil: 0,760');
});
