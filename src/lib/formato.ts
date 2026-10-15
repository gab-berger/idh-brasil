const numero = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/** Valor com três casas decimais e vírgula: 0.805 -> "0,805". */
export function num(valor: number): string {
	return numero.format(valor);
}

/** Variação com sinal; o negativo usa o sinal de menos tipográfico: 0.428 -> "+0,428", -0.01 -> "−0,010". */
export function delta(valor: number): string {
	const sinal = valor < 0 ? '−' : '+';
	return sinal + numero.format(Math.abs(valor));
}

/** Posição no ranking, com o indicador ordinal: 84 -> "84º". */
export function posicao(n: number): string {
	return `${n}º`;
}
