import type { ChaveTexto } from './textos';

export interface Aba {
	/** Rota do SvelteKit, sem o caminho base (o link usa resolve()). */
	rota: '/' | '/mundo' | '/entenda';
	/** Chave em textos.pt.json com o nome da aba. */
	chave: ChaveTexto;
}

/** As três abas, na ordem do cabeçalho. Cada uma é uma página com endereço próprio. */
export const ABAS: Aba[] = [
	{ rota: '/', chave: 'abas.brasil' },
	{ rota: '/mundo', chave: 'abas.mundo' },
	{ rota: '/entenda', chave: 'abas.entenda' }
];
