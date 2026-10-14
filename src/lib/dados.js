import { asset } from '$app/paths';

/** @type {Map<string, Promise<any>>} */
const cache = new Map();

/**
 * Carrega um arquivo de static/dados, uma vez. Chamar só no navegador (ex.: em onMount):
 * durante o build, a página é gerada sem dados.
 * @param {string} nome ex.: 'idhm_uf.json'
 * @returns {Promise<any>}
 */
export function carregar(nome) {
	let pedido = cache.get(nome);
	if (!pedido) {
		const url = asset(/** @type {any} */ (`/dados/${nome}`));
		pedido = fetch(url).then((resposta) => {
			if (!resposta.ok) throw new Error(`Não foi possível carregar ${nome} (${resposta.status})`);
			return resposta.json();
		});
		cache.set(nome, pedido);
	}
	return pedido;
}
