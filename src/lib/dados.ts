import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';

const cache = new Map<string, Promise<unknown>>();

/**
 * Carrega um arquivo de static/dados, uma vez. Chamar só no navegador (ex.: em onMount):
 * durante o build, a página sai sem dados.
 * O tipo T é declarado por quem chama (ver tipos.ts). O JSON não é validado em tempo de execução;
 * a checagem de dados fica em scripts/preparar_dados.py.
 */
export function carregar<T>(nome: string): Promise<T> {
	let pedido = cache.get(nome);
	if (!pedido) {
		// Os arquivos de dados são gerados fora do build, então o Kit não conhece o caminho: o cast é intencional.
		const url = asset(`/dados/${nome}` as AssetPath);
		pedido = fetch(url).then((resposta) => {
			if (!resposta.ok) throw new Error(`Não foi possível carregar ${nome} (${resposta.status})`);
			return resposta.json() as Promise<unknown>;
		});
		cache.set(nome, pedido);
	}
	return pedido as Promise<T>;
}
