<script lang="ts">
	import { onMount } from 'svelte';
	import { carregar } from '#lib/dados';
	import { COR_BRASIL } from '#lib/escalas';
	import { estado } from '#lib/estado.svelte';
	import Linhas from '#lib/graficos/Linhas.svelte';
	import { estiloDaLinha, pontosDe, rotuloDe } from '#lib/mundo';
	import { t } from '#lib/textos';
	import type { EstiloLinha, LinhaMedia, LinhaPais, SerieLinha } from '#lib/tipos';
	import SeletorLinhas from './mundo/SeletorLinhas.svelte';

	const TRACO: Record<EstiloLinha, string | undefined> = { solid: undefined, dashed: '8 5', dotted: '2 4' };
	const DOMINIO_Y: [number, number] = [0.4, 0.95];
	const ANOS: [number, number] = [1990, 2023];

	let paises: LinhaPais[] | null = $state.raw(null);
	let medias: LinhaMedia[] | null = $state.raw(null);
	let erro = $state(false);

	// Os dados só são lidos no navegador: o build sai com a parte de texto da aba, sem o gráfico.
	onMount(() => {
		Promise.all([carregar<LinhaPais[]>('idh_paises.json'), carregar<LinhaMedia[]>('medias.json')])
			.then(([dadosPaises, dadosMedias]) => {
				paises = dadosPaises;
				medias = dadosMedias;
			})
			.catch(() => (erro = true));
	});

	// O Brasil sempre aparece, grosso e contínuo; as outras linhas seguem a ordem em que foram ligadas.
	const series = $derived.by((): SerieLinha[] => {
		const dadosPaises = paises;
		const dadosMedias = medias;
		if (!dadosPaises || !dadosMedias) return [];
		const brasil: SerieLinha = {
			chave: 'BRA',
			rotulo: rotuloDe('BRA'),
			cor: COR_BRASIL,
			espessura: 3,
			pontos: pontosDe('BRA', dadosPaises, dadosMedias)
		};
		const ligadas = Object.entries(estado.linhas).map(
			([chave, cor], indice): SerieLinha => ({
				chave,
				rotulo: rotuloDe(chave),
				cor,
				traco: TRACO[estiloDaLinha(chave, indice)],
				pontos: pontosDe(chave, dadosPaises, dadosMedias)
			})
		);
		return [brasil, ...ligadas];
	});
</script>

<section id="comparacao" class="comparacao" aria-labelledby="comparacao-titulo">
	<h2 id="comparacao-titulo">{t('mundo.grafico.titulo')}</h2>
	{#if erro}
		<p role="alert">{t('erro.carregar')}</p>
	{:else if series.length === 0}
		<p>{t('carregando')}</p>
	{:else}
		<SeletorLinhas />
		<Linhas
			{series}
			dominioY={DOMINIO_Y}
			anos={ANOS}
			rotulosX={[1990, 2000, 2010, 2023]}
			descricao={t('mundo.grafico.rotulo')}
			legendaTabela={t('mundo.grafico.tabela')}
		/>
	{/if}
</section>
