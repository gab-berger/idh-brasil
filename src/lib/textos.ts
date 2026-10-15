import textos from './textos.pt.json';

/** Chaves que existem em textos.pt.json. Uma chave digitada errada vira erro de tipo. */
export type ChaveTexto = keyof typeof textos;

/**
 * Texto da interface pela chave. `{nome}` no texto é trocado pelo valor de `vars`.
 * Variável ausente é erro, para que nada apareça na tela sem estar em textos.pt.json.
 */
export function t(chave: ChaveTexto, vars: Record<string, string | number> = {}): string {
	const texto: string | undefined = textos[chave];
	if (texto === undefined) throw new Error(`Texto ausente em textos.pt.json: ${chave}`);
	return texto.replace(/\{(\w+)\}/g, (_, nome: string) => {
		if (!(nome in vars)) throw new Error(`Variável ausente em ${chave}: ${nome}`);
		return String(vars[nome]);
	});
}
