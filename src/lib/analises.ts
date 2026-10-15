/**
 * Análises prontas da aba Brasil. São calculadas no build a partir dos dados prontos, então a página
 * sai com o texto mesmo sem JavaScript. Cada número é conferido em analises.spec.ts.
 */
import { delta, juntar, num } from './formato';
import { obrigatorio } from './obrigatorio';
import { linhaUf, ufsDoAno } from './series';
import { t } from './textos';
import type { Analise, Dimensao, LinhaRegiao, LinhaUf } from './tipos';

const INICIO = 1991;
const FIM = 2024;
const DIMENSOES: Dimensao[] = ['longevidade', 'educacao', 'renda'];

/** Arredonda para as 3 casas dos dados, para que uma diferença como 0,198 não vire 0,19799999. */
function arred(valor: number): number {
	return Math.round(valor * 1000) / 1000;
}

function verbo(antes: number, depois: number): string {
	return depois < antes ? t('analise.caiu') : t('analise.subiu');
}

/** Qual região mais avançou, e se a distância entre a região mais alta e a mais baixa diminuiu. */
function regiaoQueMaisAvancou(regioes: LinhaRegiao[]): Analise {
	const doAno = (ano: number) => regioes.filter((r) => r.ano === ano);
	const distancia = (linhas: LinhaRegiao[]) =>
		arred(Math.max(...linhas.map((r) => r.idhm)) - Math.min(...linhas.map((r) => r.idhm)));
	const inicio = doAno(INICIO);
	const fim = doAno(FIM);
	const ganhos = fim
		.map((r) => {
			const antes = obrigatorio(inicio.find((x) => x.regiao === r.regiao), `${r.nome} em ${INICIO}`);
			return { nome: r.nome, antes: antes.idhm, depois: r.idhm, ganho: arred(r.idhm - antes.idhm) };
		})
		.sort((a, b) => b.ganho - a.ganho);
	const melhor = obrigatorio(ganhos[0], 'regiões');
	const distInicio = distancia(inicio);
	const distFim = distancia(fim);
	return {
		id: 'regioes',
		titulo: t('analise.regioes.titulo'),
		texto: t('analise.regioes.texto', {
			regiao: melhor.nome,
			ini: num(melhor.antes),
			fim: num(melhor.depois),
			ano_ini: INICIO,
			ano_fim: FIM,
			delta: delta(melhor.ganho),
			verbo: verbo(distInicio, distFim),
			dist_ini: num(distInicio),
			dist_fim: num(distFim)
		}),
		acao: { rotulo: t('analise.regioes.acao'), alvo: 'regioes', medida: 'idhm' }
	};
}

/** Distância entre o maior e o menor IDHM estadual, no primeiro e no último ano. */
function distanciaEntreEstados(linhas: LinhaUf[]): Analise {
	const extremos = (ano: number) => {
		const ordenadas = ufsDoAno(linhas, ano).sort((a, b) => b.idhm - a.idhm || a.nome.localeCompare(b.nome, 'pt-BR'));
		const maior = obrigatorio(ordenadas[0], `estados em ${ano}`);
		const menor = obrigatorio(ordenadas[ordenadas.length - 1], `estados em ${ano}`);
		return { maior, menor, distancia: arred(maior.idhm - menor.idhm) };
	};
	const ini = extremos(INICIO);
	const fim = extremos(FIM);
	return {
		id: 'estados',
		titulo: t('analise.estados.titulo'),
		texto: t('analise.estados.texto', {
			ano_ini: INICIO,
			dist_ini: num(ini.distancia),
			maior_ini: ini.maior.nome,
			v_maior_ini: num(ini.maior.idhm),
			menor_ini: ini.menor.nome,
			v_menor_ini: num(ini.menor.idhm),
			ano_fim: FIM,
			verbo: verbo(ini.distancia, fim.distancia),
			dist_fim: num(fim.distancia),
			maior_fim: fim.maior.nome,
			v_maior_fim: num(fim.maior.idhm),
			menor_fim: fim.menor.nome,
			v_menor_fim: num(fim.menor.idhm)
		}),
		acao: { rotulo: t('analise.estados.acao', { ano: INICIO }), alvo: 'mapa', medida: 'idhm', ano: INICIO, uf: null }
	};
}

/** Os 5 estados que mais avançaram no IDHM e os 3 que menos avançaram. */
function quemMaisAvancou(linhas: LinhaUf[]): Analise {
	const ganhos = ufsDoAno(linhas, FIM)
		.map((fim) => {
			const ini = obrigatorio(linhaUf(linhas, fim.uf, INICIO), `${fim.nome} em ${INICIO}`);
			return { uf: fim.uf, nome: fim.nome, ganho: arred(fim.idhm - ini.idhm) };
		})
		.sort((a, b) => b.ganho - a.ganho || a.nome.localeCompare(b.nome, 'pt-BR'));
	const item = (g: { nome: string; ganho: number }) => t('analise.avanco.item', { nome: g.nome, delta: delta(g.ganho) });
	const primeiro = obrigatorio(ganhos[0], 'estados');
	return {
		id: 'avanco',
		titulo: t('analise.avanco.titulo'),
		texto: t('analise.avanco.texto', {
			ano_ini: INICIO,
			ano_fim: FIM,
			lista: juntar(ganhos.slice(0, 5).map(item)),
			ultimos: juntar(ganhos.slice(-3).reverse().map(item))
		}),
		acao: {
			rotulo: t('analise.avanco.acao', { nome: primeiro.nome }),
			alvo: 'mapa',
			medida: 'idhm',
			ano: FIM,
			uf: primeiro.uf
		}
	};
}

/** Qual dimensão do Brasil mais subiu, e quanto subiram as outras duas. */
function oQuePuxou(linhas: LinhaUf[]): Analise {
	const ini = obrigatorio(linhaUf(linhas, 'BR', INICIO), `Brasil em ${INICIO}`);
	const fim = obrigatorio(linhaUf(linhas, 'BR', FIM), `Brasil em ${FIM}`);
	const dimensoes = DIMENSOES.map((d) => ({ d, antes: ini[d], depois: fim[d], ganho: arred(fim[d] - ini[d]) })).sort(
		(a, b) => b.ganho - a.ganho
	);
	const [maior, ...outras] = dimensoes;
	const nome = t(`medida.${maior.d}`);
	return {
		id: 'dimensoes',
		titulo: t('analise.dimensoes.titulo'),
		texto: t('analise.dimensoes.texto', {
			dimensao: nome,
			ini: num(maior.antes),
			fim: num(maior.depois),
			ano_ini: INICIO,
			ano_fim: FIM,
			delta: delta(maior.ganho),
			outras: juntar(
				outras.map((o) =>
					t('analise.dimensoes.outra', {
						dimensao: t(`medida.${o.d}`),
						verbo: verbo(o.antes, o.depois),
						valor: num(Math.abs(o.ganho))
					})
				)
			)
		}),
		acao: { rotulo: t('analise.dimensoes.acao', { dimensao: nome }), alvo: 'mapa', medida: maior.d, ano: FIM, uf: null }
	};
}

/** As análises da aba Brasil, na ordem em que giram: primeiro as regiões, a pergunta da aba. */
export function analisesDoBrasil(linhas: LinhaUf[], regioes: LinhaRegiao[]): Analise[] {
	return [regiaoQueMaisAvancou(regioes), distanciaEntreEstados(linhas), quemMaisAvancou(linhas), oQuePuxou(linhas)];
}
