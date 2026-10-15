import type { ChaveTexto } from './textos';

export interface Bloco {
	id: string;
	/** Chave em textos.pt.json com o nome do bloco. */
	chave: ChaveTexto;
}

/** Os seis blocos da página, na ordem em que aparecem. */
export const BLOCOS: Bloco[] = [
	{ id: 'abertura', chave: 'blocos.abertura' },
	{ id: 'oque-e-o-idh', chave: 'blocos.oque' },
	{ id: 'estados', chave: 'blocos.estados' },
	{ id: 'avancos', chave: 'blocos.avancos' },
	{ id: 'mundo', chave: 'blocos.mundo' },
	{ id: 'fontes', chave: 'blocos.fontes' }
];
