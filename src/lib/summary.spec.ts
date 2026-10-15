import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { summaryText } from './summary';
import { stateRow } from './series';
import type { StateRow } from './types';

const rows = JSON.parse(
	readFileSync(new URL('../../data/ready/idhm_states.json', import.meta.url), 'utf-8')
) as StateRow[];

test('Brazil highlight in 2024: the IDHM with its band; the components only with the value', () => {
	const brazil = stateRow(rows, 'BR', 2024);
	if (!brazil) throw new Error('Missing data: Brazil 2024');
	expect(summaryText(brazil, 'idhm')).toBe('IDH Brasil: 0,805 – muito alto');
	expect(summaryText(brazil, 'income')).toBe('Renda Brasil: 0,760');
});
