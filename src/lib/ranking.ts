import type { Medida } from './tipos';

/** Posição de cada UF pelo valor da medida: 1 é o maior. Empates dividem a posição (1, 2, 2, 4). */
export function posicoes<T extends { uf: string } & Record<Medida, number>>(
	linhas: T[],
	medida: Medida
): Map<string, number> {
	return new Map(
		linhas.map((linha): [string, number] => [
			linha.uf,
			1 + linhas.filter((outra) => outra[medida] > linha[medida]).length
		])
	);
}
