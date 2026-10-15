/**
 * Números dos cartões de abertura (bloco 1). São calculados a partir dos dados prontos, no build,
 * então a página sai com os números mesmo com JavaScript desligado. Os textos vêm de textos.pt.json.
 */
import { faixaIdhm } from './escalas';
import { num, posicao } from './formato';
import { linhaUf, ufsDoAno } from './series';
import { t } from './textos';
import type { LinhaUf, Pais } from './tipos';

export interface Abertura {
	idhm: { valor: string; faixa: string };
	extremos: { maior: { nome: string; valor: string }; menor: { nome: string; valor: string } };
	mundo: { posicao: string; detalhe: string };
	anos: { ano: number; frase: string }[];
}

/** Valor que a abertura exige: falha com mensagem se estiver ausente (undefined ou null nos dados). */
function obrigatorio<T>(valor: T | null | undefined, descricao: string): T {
	if (valor === undefined || valor === null) throw new Error(`Ausente nos dados: ${descricao}`);
	return valor;
}

/** Junta nomes em português: "A", "A e B", "A, B e C". */
function juntar(nomes: string[]): string {
	if (nomes.length <= 1) return nomes.join('');
	return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

/** Estado com maior IDHM da lista. */
function maiorIdhm(linhas: LinhaUf[]): LinhaUf {
	return linhas.reduce((melhor, linha) => (linha.idhm > melhor.idhm ? linha : melhor));
}

export function numerosAbertura(linhas: LinhaUf[], paises: Pais[]): Abertura {
	const brasil2024 = obrigatorio(linhaUf(linhas, 'BR', 2024), 'Brasil em 2024');

	const porIdhm = [...ufsDoAno(linhas, 2024)].sort((a, b) => b.idhm - a.idhm);
	const maior = obrigatorio(porIdhm[0], 'maior estado em 2024');
	const menor = obrigatorio(porIdhm[porIdhm.length - 1], 'menor estado em 2024');

	const brasilNoMundo = obrigatorio(
		paises.find((pais) => pais.iso3 === 'BRA'),
		'Brasil no HDR'
	);
	const posicaoBr = obrigatorio(brasilNoMundo.posicao_2023, 'posição do Brasil em 2023');
	const idhBr = obrigatorio(brasilNoMundo.idh_2023, 'IDH do Brasil em 2023');
	const empatados = paises
		.filter((pais) => pais.iso3 !== 'BRA' && pais.posicao_2023 === posicaoBr)
		.map((pais) => pais.nome_pt);
	const detalheMundo =
		empatados.length > 0
			? t('abertura.mundo.detalhe', { idh: num(idhBr), outros: juntar(empatados) })
			: t('abertura.mundo.detalhe_sem_empate', { idh: num(idhBr) });

	// 1991: quantos estados estavam na faixa muito baixa, e quem era o maior.
	const estados1991 = ufsDoAno(linhas, 1991);
	const muitoBaixo1991 = estados1991.filter((l) => faixaIdhm(l.idhm) === 'muito_baixo').length;
	const maior1991 = maiorIdhm(estados1991);
	const frase1991 = t('abertura.1991', {
		n: muitoBaixo1991,
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
			? t('abertura.2010.abaixo_nenhum')
			: t('abertura.2010.abaixo_alguns', { n: abaixo2010.length });
	const parteAcima =
		acima2010.length === 0
			? t('abertura.2010.acima_nenhum')
			: acima2010.length === 1
				? t('abertura.2010.acima_unico', { uf: acima2010[0].uf })
				: t('abertura.2010.acima_varios', { n: acima2010.length });
	const frase2010 = t('abertura.2010', { abaixo: parteAbaixo, acima: parteAcima });

	// 2024: se todos estão na faixa alta ou acima, e quantos passam de 0,800.
	const estados2024 = ufsDoAno(linhas, 2024);
	const abaixoAlta2024 = estados2024.filter((l) => l.idhm < 0.7).length;
	const passam2024 = estados2024.filter((l) => l.idhm > 0.8).length;
	const parteTodos =
		abaixoAlta2024 === 0 ? t('abertura.2024.todos') : t('abertura.2024.abaixo', { n: abaixoAlta2024 });
	const partePassam =
		passam2024 === 1 ? t('abertura.2024.passa', { n: passam2024 }) : t('abertura.2024.passam', { n: passam2024 });
	const frase2024 = t('abertura.2024', { todos: parteTodos, passam: partePassam });

	return {
		idhm: { valor: num(brasil2024.idhm), faixa: t(`faixa.${faixaIdhm(brasil2024.idhm)}`) },
		extremos: {
			maior: { nome: maior.nome, valor: num(maior.idhm) },
			menor: { nome: menor.nome, valor: num(menor.idhm) }
		},
		mundo: { posicao: posicao(posicaoBr), detalhe: detalheMundo },
		anos: [
			{ ano: 1991, frase: frase1991 },
			{ ano: 2010, frase: frase2010 },
			{ ano: 2024, frase: frase2024 }
		]
	};
}
