/** Textos que acompanham o mapa: o Brasil acima dele, e o maior e o menor estado embaixo. */
import { faixaIdhm } from './escalas';
import { num } from './formato';
import { t } from './textos';
import type { LinhaUf, Medida } from './tipos';

/** O Brasil no ano e na medida. No IDHM, com a faixa: as faixas só existem para o IDHM. */
export function textoResumo(brasil: LinhaUf, medida: Medida): string {
	const vars = { ano: brasil.ano, medida: t(`medida.${medida}`), valor: num(brasil[medida]) };
	if (medida !== 'idhm') return t('resumo.brasil', vars);
	return t('resumo.brasil_faixa', { ...vars, faixa: t(`faixa.${faixaIdhm(brasil.idhm)}`) });
}

/** Maior e menor estado na medida; empate se resolve pela ordem alfabética. Lista vazia: null. */
export function extremos(linhas: LinhaUf[], medida: Medida): { maior: LinhaUf; menor: LinhaUf } | null {
	if (linhas.length === 0) return null;
	const ordenadas = [...linhas].sort((a, b) => b[medida] - a[medida] || a.nome.localeCompare(b.nome, 'pt-BR'));
	return { maior: ordenadas[0], menor: ordenadas[ordenadas.length - 1] };
}

/** Frase com o maior e o menor estado, para os anos e as medidas sem frase própria. */
export function textoExtremos(linhas: LinhaUf[], medida: Medida): string {
	const par = extremos(linhas, medida);
	if (!par) return '';
	return t('frase.extremos', {
		medida: t(`medida.${medida}`),
		maior: par.maior.nome,
		vmaior: num(par.maior[medida]),
		menor: par.menor.nome,
		vmenor: num(par.menor[medida])
	});
}
