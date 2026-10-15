import { lerDados } from '#lib/dados.server';
import { destaqueDoBrasil, evolucaoDoBrasil, vizinhosDoBrasil } from '#lib/mundo';
import type { LinhaMedia, LinhaPais, Pais } from '#lib/tipos';
import type { PageServerLoad } from './$types';

// Calculado no build: o destaque, o trecho do ranking e a leitura da evolução saem no HTML, sem JavaScript.
export const load: PageServerLoad = () => {
	const paises = lerDados<Pais[]>('paises.json');
	const linhasPais = lerDados<LinhaPais[]>('idh_paises.json');
	const medias = lerDados<LinhaMedia[]>('medias.json');
	return {
		destaque: destaqueDoBrasil(paises),
		vizinhos: vizinhosDoBrasil(paises),
		evolucao: evolucaoDoBrasil(linhasPais, medias)
	};
};
