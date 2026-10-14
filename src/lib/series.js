/**
 * Consultas sobre as linhas dos arquivos de dados. Funções puras: não leem nada, só filtram.
 */

/**
 * Linhas com `campo === valor`, em ordem de ano.
 * @template {{ ano: number } & Record<string, any>} T
 * @param {T[]} linhas
 * @param {string} campo
 * @param {unknown} valor
 * @returns {T[]}
 */
export function serie(linhas, campo, valor) {
	return linhas.filter((linha) => linha[campo] === valor).sort((a, b) => a.ano - b.ano);
}

/**
 * Linha de uma UF num ano, ou undefined se não houver.
 * @template {{ uf: string, ano: number }} T
 * @param {T[]} linhas
 * @param {string} uf
 * @param {number} ano
 * @returns {T | undefined}
 */
export function linhaUf(linhas, uf, ano) {
	return linhas.find((linha) => linha.uf === uf && linha.ano === ano);
}

/**
 * Linhas das 27 UFs num ano (o Brasil, uf "BR", fica de fora).
 * @template {{ uf: string, ano: number }} T
 * @param {T[]} linhas
 * @param {number} ano
 * @returns {T[]}
 */
export function ufsDoAno(linhas, ano) {
	return linhas.filter((linha) => linha.ano === ano && linha.uf !== 'BR');
}
