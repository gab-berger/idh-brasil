/**
 * Posição de cada UF pelo valor da medida: 1 é o maior. Empates dividem a posição (1, 2, 2, 4).
 * @template {{ uf: string } & Record<string, any>} T
 * @param {T[]} linhas
 * @param {string} medida
 * @returns {Map<string, number>}
 */
export function posicoes(linhas, medida) {
	return new Map(
		linhas.map((linha) => [linha.uf, 1 + linhas.filter((outra) => outra[medida] > linha[medida]).length])
	);
}
