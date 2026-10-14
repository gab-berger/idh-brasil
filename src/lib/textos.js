import textos from './textos.pt.json';

/**
 * Texto da interface pela chave. `{nome}` no texto é trocado pelo valor de `vars`.
 * Chave ou variável ausente é erro, para que nada apareça na tela sem estar em textos.pt.json.
 * @param {string} chave
 * @param {Record<string, string | number>} [vars]
 * @returns {string}
 */
export function t(chave, vars = {}) {
	const texto = /** @type {Record<string, string>} */ (textos)[chave];
	if (texto === undefined) throw new Error(`Texto ausente em textos.pt.json: ${chave}`);
	return texto.replace(/\{(\w+)\}/g, (_, nome) => {
		if (!(nome in vars)) throw new Error(`Variável ausente em ${chave}: ${nome}`);
		return String(vars[nome]);
	});
}
