/** Consultas sobre as linhas dos arquivos de dados. Funções puras: não leem nada, só filtram. */

/** Linhas com `campo === valor`, em ordem de ano. */
export function serie<T extends { ano: number }>(linhas: T[], campo: keyof T, valor: T[keyof T]): T[] {
	return linhas.filter((linha) => linha[campo] === valor).sort((a, b) => a.ano - b.ano);
}

/** Linha de uma UF num ano, ou undefined se não houver. */
export function linhaUf<T extends { uf: string; ano: number }>(
	linhas: T[],
	uf: string,
	ano: number
): T | undefined {
	return linhas.find((linha) => linha.uf === uf && linha.ano === ano);
}

/** Linhas das 27 UFs num ano (o Brasil, uf "BR", fica de fora). */
export function ufsDoAno<T extends { uf: string; ano: number }>(linhas: T[], ano: number): T[] {
	return linhas.filter((linha) => linha.ano === ano && linha.uf !== 'BR');
}
