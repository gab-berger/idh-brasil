import { analisesDoBrasil } from '#lib/analises';
import { lerDados } from '#lib/dados.server';
import { frasesDosAnos } from '#lib/frases';
import type { LinhaRegiao, LinhaUf } from '#lib/tipos';
import type { PageServerLoad } from './$types';

// Calculado no build: as frases dos anos e as análises saem prontas no HTML, sem depender de JavaScript.
export const load: PageServerLoad = () => {
	const uf = lerDados<LinhaUf[]>('idhm_uf.json');
	const regioes = lerDados<LinhaRegiao[]>('regioes.json');
	return { frases: frasesDosAnos(uf), analises: analisesDoBrasil(uf, regioes) };
};
