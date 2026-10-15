import { analisesDoBrasil } from '#lib/analises';
import { lerDados } from '#lib/dados.server';
import type { LinhaRegiao, LinhaUf } from '#lib/tipos';
import type { PageServerLoad } from './$types';

// Calculado no build: as análises saem prontas no HTML, sem depender de JavaScript.
export const load: PageServerLoad = () => {
	const uf = lerDados<LinhaUf[]>('idhm_uf.json');
	const regioes = lerDados<LinhaRegiao[]>('regioes.json');
	return { analises: analisesDoBrasil(uf, regioes) };
};
