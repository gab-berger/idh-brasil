<script lang="ts">
	import { onMount } from 'svelte';
	import Nota from '#lib/Nota.svelte';
	import Linhas from '#lib/graficos/Linhas.svelte';
	import { carregar } from '#lib/dados';
	import { ANOS, COR_BRASIL, CORES_REGIOES, DOMINIOS, REGIOES } from '#lib/escalas';
	import { estado } from '#lib/estado.svelte';
	import { serie } from '#lib/series';
	import { t } from '#lib/textos';
	import type { LinhaRegiao, LinhaUf, SerieLinha } from '#lib/tipos';

	const PRIMEIRO = ANOS[0];
	const ULTIMO = ANOS[ANOS.length - 1];
	// Os rótulos da régua, sem 2012: numa tela estreita ele fica colado em 2010.
	const ROTULOS_X = [1991, 2000, 2010, 2024];
	// Não há dado de 2011: a troca do Censo pela PNAD Contínua aparece como um vão nas linhas.
	const QUEBRA = 2011;

	let regioes: LinhaRegiao[] | null = $state.raw(null);
	let uf: LinhaUf[] | null = $state.raw(null);
	let erro = $state(false);

	onMount(() => {
		Promise.all([carregar<LinhaRegiao[]>('regioes.json'), carregar<LinhaUf[]>('idhm_uf.json')])
			.then(([dadosRegioes, dadosUf]) => {
				regioes = dadosRegioes;
				uf = dadosUf;
			})
			.catch(() => (erro = true));
	});

	const series = $derived.by((): SerieLinha[] => {
		const dadosRegioes = regioes;
		const dadosUf = uf;
		if (!dadosRegioes || !dadosUf) return [];
		const medida = estado.medida;
		const dasRegioes = REGIOES.map((sigla): SerieLinha => {
			const linhas = serie(dadosRegioes, 'regiao', sigla);
			return {
				chave: sigla,
				rotulo: linhas[0]?.nome ?? sigla,
				cor: CORES_REGIOES[sigla].cor,
				traco: CORES_REGIOES[sigla].traco,
				pontos: linhas.map((l) => ({ ano: l.ano, valor: l[medida] }))
			};
		});
		const brasil: SerieLinha = {
			chave: 'BR',
			rotulo: t('geral.brasil'),
			cor: COR_BRASIL,
			espessura: 3,
			pontos: serie(dadosUf, 'uf', 'BR').map((l) => ({ ano: l.ano, valor: l[medida] }))
		};
		return [...dasRegioes, brasil];
	});
</script>

<section aria-labelledby="regioes-titulo">
	<h3 id="regioes-titulo">{t('regioes.titulo')}</h3>
	{#if erro}
		<p role="alert">{t('erro.carregar')}</p>
	{:else if series.length === 0}
		<p>{t('carregando')}</p>
	{:else}
		<Linhas
			{series}
			dominioY={DOMINIOS[estado.medida]}
			anos={[PRIMEIRO, ULTIMO]}
			rotulosX={ROTULOS_X}
			marcador={estado.ano}
			quebra={QUEBRA}
			descricao={t('regioes.rotulo', { medida: t(`medida.${estado.medida}`) })}
			legendaTabela={t('regioes.tabela', { medida: t(`medida.${estado.medida}`) })}
		/>
	{/if}
	<Nota chave="regioes.nota" />
</section>
