/** Destaque acima do mapa: o indicador do Brasil no ano e na medida escolhidos. */
import { faixaIdhm } from './escalas';
import { num } from './formato';
import { t } from './textos';
import type { LinhaUf, Medida } from './tipos';

/**
 * "IDH Brasil: 0,805 – muito alto" no IDHM. Nos subíndices não há faixas, então o destaque mostra só o valor:
 * "Renda Brasil: 0,760".
 */
export function textoResumo(brasil: LinhaUf, medida: Medida): string {
	if (medida !== 'idhm') return t('destaque.medida', { medida: t(`medida.${medida}`), valor: num(brasil[medida]) });
	return t('destaque.idhm', { valor: num(brasil.idhm), faixa: t(`faixa.${faixaIdhm(brasil.idhm)}`) });
}
