import { lerDados } from '#lib/dados.server';
import { evolucaoDoBrasil, posicaoNoMundo, vizinhosDoBrasil } from '#lib/mundo';
import type { LinhaMedia, LinhaPais, Pais } from '#lib/tipos';
import type { PageServerLoad } from './$types';

// Calculado no build: a posição, o trecho do ranking e a leitura da evolução saem no HTML, sem JavaScript.
export const load: PageServerLoad = () => {
	const paises = lerDados<Pais[]>('paises.json');
	const linhasPais = lerDados<LinhaPais[]>('idh_paises.json');
	const medias = lerDados<LinhaMedia[]>('medias.json');
	return {
		posicao: posicaoNoMundo(paises),
		vizinhos: vizinhosDoBrasil(paises),
		evolucao: evolucaoDoBrasil(linhasPais, medias)
	};
};
