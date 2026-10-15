/**
 * Estado compartilhado entre os blocos. Só as funções deste arquivo mudam os valores,
 * para que as regras (ano com dado, no máximo 5 linhas, cor estável) fiquem num lugar só.
 */
import { ANOS, CORES_LINHAS, MAX_LINHAS } from './escalas';
import type { Medida, Vista } from './tipos';

export const estado = $state({
	ano: 2024,
	medida: 'idhm' as Medida,
	ufSelecionada: null as string | null,
	vista: 'mapa' as Vista,
	tocando: false,
	ufAvanco: 'BR',
	/** Linhas ligadas na comparação: chave -> cor. Até MAX_LINHAS, além do Brasil. */
	linhas: {
		mundo: CORES_LINHAS[0],
		brics: CORES_LINHAS[1],
		USA: CORES_LINHAS[2],
		CHN: CORES_LINHAS[3]
	} as Record<string, string>
});

/** Leva o mapa e os gráficos a um ano com dado. */
export function irParaAno(ano: number): void {
	if (!ANOS.includes(ano)) throw new Error(`Ano sem dado: ${ano}`);
	estado.ano = ano;
}

/**
 * Liga ou desliga uma linha da comparação. Devolve false quando o limite bloqueia a ação.
 * Uma linha nova pega a primeira cor livre; as outras não mudam de cor.
 */
export function alternarLinha(chave: string): boolean {
	if (chave in estado.linhas) {
		delete estado.linhas[chave];
		return true;
	}
	if (Object.keys(estado.linhas).length >= MAX_LINHAS) return false;
	const usadas = Object.values(estado.linhas);
	estado.linhas[chave] = CORES_LINHAS.find((cor) => !usadas.includes(cor)) ?? CORES_LINHAS[0];
	return true;
}

/** Seleciona uma UF; tocar nela de novo desmarca. */
export function alternarUf(uf: string): void {
	estado.ufSelecionada = estado.ufSelecionada === uf ? null : uf;
}
