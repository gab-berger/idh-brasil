/**
 * Frases dos anos com texto próprio (1991, 2010 e 2024), mostradas embaixo do mapa quando a medida é o IDHM.
 * São calculadas no build a partir dos dados prontos; os textos vêm de textos.pt.json.
 */
import { faixaIdhm } from './escalas';
import { num } from './formato';
import { ufsDoAno } from './series';
import { t } from './textos';
import type { LinhaUf } from './tipos';

/** Estado com maior IDHM da lista. */
function maiorIdhm(linhas: LinhaUf[]): LinhaUf {
	return linhas.reduce((melhor, linha) => (linha.idhm > melhor.idhm ? linha : melhor));
}

export function frasesDosAnos(linhas: LinhaUf[]): Record<number, string> {
	// 1991: quantos estados estavam na faixa muito baixa, e quem era o maior.
	const estados1991 = ufsDoAno(linhas, 1991);
	const maior1991 = maiorIdhm(estados1991);
	const frase1991 = t('frase.1991', {
		n: estados1991.filter((l) => faixaIdhm(l.idhm) === 'muito_baixo').length,
		total: estados1991.length,
		uf: maior1991.uf,
		valor: num(maior1991.idhm)
	});

	// 2010: quantos ficaram abaixo de 0,600, e quem ficou acima de 0,800.
	const estados2010 = ufsDoAno(linhas, 2010);
	const abaixo2010 = estados2010.filter((l) => l.idhm < 0.6);
	const acima2010 = estados2010.filter((l) => l.idhm > 0.8);
	const parteAbaixo =
		abaixo2010.length === 0
			? t('frase.2010.abaixo_nenhum')
			: t('frase.2010.abaixo_alguns', { n: abaixo2010.length });
	const parteAcima =
		acima2010.length === 0
			? t('frase.2010.acima_nenhum')
			: acima2010.length === 1
				? t('frase.2010.acima_unico', { uf: acima2010[0].uf })
				: t('frase.2010.acima_varios', { n: acima2010.length });
	const frase2010 = t('frase.2010', { abaixo: parteAbaixo, acima: parteAcima });

	// 2024: se todos estão na faixa alta ou acima, e quantos passam de 0,800.
	const estados2024 = ufsDoAno(linhas, 2024);
	const abaixoAlta2024 = estados2024.filter((l) => l.idhm < 0.7).length;
	const passam2024 = estados2024.filter((l) => l.idhm > 0.8).length;
	const parteTodos =
		abaixoAlta2024 === 0 ? t('frase.2024.todos') : t('frase.2024.abaixo', { n: abaixoAlta2024 });
	const partePassam =
		passam2024 === 1 ? t('frase.2024.passa', { n: passam2024 }) : t('frase.2024.passam', { n: passam2024 });
	const frase2024 = t('frase.2024', { todos: parteTodos, passam: partePassam });

	return { 1991: frase1991, 2010: frase2010, 2024: frase2024 };
}
