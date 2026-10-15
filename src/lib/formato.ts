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

const eixo = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

/** Valor curto para eixos de gráfico: 0.5 -> "0,5", 0.75 -> "0,75". */
export function numEixo(valor: number): string {
	return eixo.format(valor);
}

/** Junta nomes em português: "A", "A e B", "A, B e C". */
export function juntar(nomes: string[]): string {
	if (nomes.length <= 1) return nomes.join('');
	return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

/** Data ISO no formato brasileiro: "2026-10-14" -> "14/10/2026". */
export function dataBr(iso: string): string {
	const [ano, mes, dia] = iso.split('-');
	return `${dia}/${mes}/${ano}`;
}
