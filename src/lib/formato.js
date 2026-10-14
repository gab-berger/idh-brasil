const numero = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/**
 * Valor com três casas decimais e vírgula: 0.805 -> "0,805".
 * @param {number} valor
 */
export function num(valor) {
	return numero.format(valor);
}

/**
 * Variação com sinal; o negativo usa o sinal de menos tipográfico: 0.428 -> "+0,428", -0.01 -> "−0,010".
 * @param {number} valor
 */
export function delta(valor) {
	const sinal = valor < 0 ? '−' : '+';
	return sinal + numero.format(Math.abs(valor));
}

/**
 * Posição no ranking, com o indicador ordinal: 84 -> "84º".
 * @param {number} posicao
 */
export function posicao(posicao) {
	return `${posicao}º`;
}
