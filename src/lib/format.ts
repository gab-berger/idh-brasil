const threeDecimals = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/** Value with three decimals and a decimal comma: 0.805 -> "0,805". */
export function num(value: number): string {
	return threeDecimals.format(value);
}

/** Change with a sign; a negative uses the typographic minus: 0.428 -> "+0,428", -0.01 -> "−0,010". */
export function delta(value: number): string {
	const sign = value < 0 ? '−' : '+';
	return sign + threeDecimals.format(Math.abs(value));
}

/** Position in a ranking, with the ordinal indicator: 84 -> "84º". */
export function position(n: number): string {
	return `${n}º`;
}

const axis = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

/** Short value for chart axes: 0.5 -> "0,5", 0.75 -> "0,75". */
export function axisNumber(value: number): string {
	return axis.format(value);
}

/** Joins Portuguese names: "A", "A e B", "A, B e C". */
export function joinList(names: string[]): string {
	if (names.length <= 1) return names.join('');
	return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

/** ISO date in the Brazilian format: "2026-10-14" -> "14/10/2026". */
export function dateBr(iso: string): string {
	const [year, month, day] = iso.split('-');
	return `${day}/${month}/${year}`;
}
