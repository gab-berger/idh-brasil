/** Valor que um cálculo exige: falha com mensagem se estiver ausente (undefined ou null nos dados). */
export function obrigatorio<T>(valor: T | null | undefined, descricao: string): T {
	if (valor === undefined || valor === null) throw new Error(`Ausente nos dados: ${descricao}`);
	return valor;
}
