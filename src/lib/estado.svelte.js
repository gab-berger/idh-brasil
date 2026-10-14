/**
 * Estado compartilhado entre os blocos. Só as funções deste arquivo mudam os valores,
 * para que as regras (ano com dado, no máximo 5 linhas, cor estável) fiquem num lugar só.
 */
import { ANOS, CORES_LINHAS, MAX_LINHAS } from './escalas.js';

export const estado = $state({
	ano: 2024,
	medida: /** @type {'idhm' | 'longevidade' | 'educacao' | 'renda'} */ ('idhm'),
	ufSelecionada: /** @type {string | null} */ (null),
	vista: /** @type {'mapa' | 'ranking'} */ ('mapa'),
	tocando: false,
	ufAvanco: 'BR',
	/** Linhas ligadas na comparação: chave -> cor. Até MAX_LINHAS, além do Brasil. */
	linhas: /** @type {Record<string, string>} */ ({
		mundo: CORES_LINHAS[0],
		brics: CORES_LINHAS[1],
		USA: CORES_LINHAS[2],
		CHN: CORES_LINHAS[3]
	})
});

/**
 * Leva o mapa e os gráficos a um ano com dado.
 * @param {number} ano
 */
export function irParaAno(ano) {
	if (!ANOS.includes(ano)) throw new Error(`Ano sem dado: ${ano}`);
	estado.ano = ano;
}

/**
 * Liga ou desliga uma linha da comparação. Devolve false quando o limite bloqueia a ação.
 * Uma linha nova pega a primeira cor livre; as outras não mudam de cor.
 * @param {string} chave código ISO3 do país ou nome do grupo (mundo, brics...)
 * @returns {boolean}
 */
export function alternarLinha(chave) {
	if (chave in estado.linhas) {
		delete estado.linhas[chave];
		return true;
	}
	if (Object.keys(estado.linhas).length >= MAX_LINHAS) return false;
	const usadas = Object.values(estado.linhas);
	estado.linhas[chave] = CORES_LINHAS.find((cor) => !usadas.includes(cor)) ?? CORES_LINHAS[0];
	return true;
}

/**
 * Seleciona uma UF; tocar nela de novo desmarca.
 * @param {string} uf
 */
export function alternarUf(uf) {
	estado.ufSelecionada = estado.ufSelecionada === uf ? null : uf;
}
