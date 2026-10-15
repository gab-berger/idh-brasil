<script lang="ts">
	import { ANOS } from '#lib/escalas';
	import { estado, irParaAno } from '#lib/estado.svelte';
	import { indiceMaisProximo, percentualDoAno } from '#lib/tempo';
	import { t } from '#lib/textos';

	const PASSO_MS = 800;
	const ULTIMO = ANOS.length - 1;
	const indice = $derived(ANOS.indexOf(estado.ano));
	const PASSOS: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };

	// Rótulos da régua: o lado diz em que direção o texto cresce a partir do traço.
	const ROTULOS: { ano: number; lado: 'esq' | 'meio' | 'dir' }[] = [
		{ ano: 1991, lado: 'esq' },
		{ ano: 2000, lado: 'meio' },
		{ ano: 2010, lado: 'dir' },
		{ ano: 2012, lado: 'esq' },
		{ ano: 2024, lado: 'dir' }
	];
	// Vãos entre os Censos: 9 anos (1991-2000) e 10 anos (2000-2010).
	const VAOS: { de: number; ate: number }[] = [
		{ de: 1991, ate: 2000 },
		{ de: 2000, ate: 2010 }
	];

	let trilho: HTMLElement | undefined = $state();
	let arrastando = false;

	const fonteDo = (ano: number): string => (ano <= 2010 ? t('fonte.censo') : t('fonte.pnad'));

	// Um ano a cada PASSO_MS. Se já estiver em 2024, recomeça em 1991. Para ao chegar em 2024.
	$effect(() => {
		if (!estado.tocando) return;
		const id = setInterval(() => {
			const i = ANOS.indexOf(estado.ano);
			if (i >= ULTIMO) {
				estado.tocando = false;
				return;
			}
			irParaAno(ANOS[i + 1]);
		}, PASSO_MS);
		return () => clearInterval(id);
	});

	function tocarOuPausar(): void {
		if (estado.tocando) {
			estado.tocando = false;
			return;
		}
		if (estado.ano === ANOS[ULTIMO]) irParaAno(ANOS[0]);
		estado.tocando = true;
	}

	function andar(passo: number): void {
		irParaAno(ANOS[Math.min(ULTIMO, Math.max(0, indice + passo))]);
	}

	function irParaPonto(clientX: number): void {
		if (!trilho) return;
		const { left, width } = trilho.getBoundingClientRect();
		const fracao = Math.min(1, Math.max(0, (clientX - left) / width));
		const novo = ANOS[indiceMaisProximo(fracao)];
		if (novo !== estado.ano) irParaAno(novo);
	}

	function apontar(evento: PointerEvent): void {
		estado.tocando = false;
		arrastando = true;
		(evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
		irParaPonto(evento.clientX);
	}

	function arrastar(evento: PointerEvent): void {
		if (arrastando) irParaPonto(evento.clientX);
	}

	function soltar(): void {
		arrastando = false;
	}

	function teclar(evento: KeyboardEvent): void {
		const passo = PASSOS[evento.key];
		if (passo) {
			evento.preventDefault();
			estado.tocando = false;
			andar(passo);
		} else if (evento.key === 'Home') {
			estado.tocando = false;
			irParaAno(ANOS[0]);
		} else if (evento.key === 'End') {
			estado.tocando = false;
			irParaAno(ANOS[ULTIMO]);
		}
	}
</script>

<svelte:document
	onvisibilitychange={() => {
		if (document.hidden) estado.tocando = false;
	}}
/>

<div class="tempo">
	<div class="controles">
		<button type="button" onclick={() => andar(-1)} disabled={estado.tocando || indice === 0}>
			{t('tempo.anterior')}
		</button>
		<button type="button" aria-pressed={estado.tocando} onclick={tocarOuPausar}>
			{estado.tocando ? t('tempo.pausar') : t('tempo.tocar')}
		</button>
		<button type="button" onclick={() => andar(1)} disabled={estado.tocando || indice === ULTIMO}>
			{t('tempo.proximo')}
		</button>
	</div>

	<p class="ano" aria-hidden="true">{estado.ano}</p>

	<div class="regua">
		<div
			class="trilho"
			role="slider"
			tabindex="0"
			aria-label={t('tempo.rotulo')}
			aria-valuemin={0}
			aria-valuemax={ULTIMO}
			aria-valuenow={indice}
			aria-valuetext={t('tempo.valortexto', { ano: estado.ano, fonte: fonteDo(estado.ano) })}
			bind:this={trilho}
			onpointerdown={apontar}
			onpointermove={arrastar}
			onpointerup={soltar}
			onpointercancel={soltar}
			onkeydown={teclar}
		>
			<div class="linha"></div>
			{#each ANOS as ano (ano)}
				<span class="marca" style:left={`${percentualDoAno(ano)}%`}></span>
			{/each}
			<!-- Troca de pesquisa: entre 2010 (Censo) e 2012 (PNAD Contínua), não há 2011. -->
			<span class="quebra" style:left={`${percentualDoAno(2011)}%`}></span>
			<span class="polegar" style:left={`${percentualDoAno(estado.ano)}%`}></span>
		</div>

		<div class="rotulos" aria-hidden="true">
			{#each ROTULOS as rotulo (rotulo.ano)}
				<span
					style:left={`${percentualDoAno(rotulo.ano)}%`}
					class:esq={rotulo.lado === 'esq'}
					class:meio={rotulo.lado === 'meio'}
					class:dir={rotulo.lado === 'dir'}>{rotulo.ano}</span
				>
			{/each}
		</div>

		<div class="vaos" aria-hidden="true">
			{#each VAOS as vao (vao.de)}
				<span style:left={`${(percentualDoAno(vao.de) + percentualDoAno(vao.ate)) / 2}%`}>
					{t('tempo.anos', { n: vao.ate - vao.de })}
				</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.tempo {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 16px 0;
	}

	.controles {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 6px;
	}

	.controles button {
		min-height: 44px;
		padding: 0 4px;
		border: 1px solid var(--linha);
		border-radius: 6px;
		background: var(--fundo);
		color: var(--texto);
		font: inherit;
		font-size: 0.9rem;
	}

	.controles button[aria-pressed='true'] {
		border-color: var(--texto);
		font-weight: 600;
	}

	.controles button:disabled {
		color: var(--texto-suave);
		opacity: 0.6;
	}

	.ano {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	/* Folga para o polegar não ser cortado nas pontas (metade dele passa do trilho). */
	.regua {
		padding: 0 16px;
	}

	/* Área de 44 px para arrastar; touch-action evita que a página role junto. */
	.trilho {
		position: relative;
		height: 44px;
		touch-action: none;
		cursor: pointer;
	}

	.linha {
		position: absolute;
		top: 50%;
		right: 0;
		left: 0;
		height: 4px;
		margin-top: -2px;
		border-radius: 2px;
		background: var(--linha);
	}

	.marca {
		position: absolute;
		top: 50%;
		width: 2px;
		height: 8px;
		margin-top: -4px;
		background: var(--texto-suave);
		transform: translateX(-50%);
	}

	.quebra {
		position: absolute;
		top: 50%;
		width: 2px;
		height: 20px;
		margin-top: -10px;
		background: var(--texto);
		transform: translateX(-50%);
		box-shadow: 4px 0 0 var(--texto);
	}

	.polegar {
		position: absolute;
		top: 50%;
		width: 24px;
		height: 24px;
		margin: -12px 0 0 -12px;
		border: 3px solid var(--fundo);
		border-radius: 50%;
		background: var(--destaque);
		box-shadow: 0 0 0 1px var(--texto);
	}

	.trilho:focus-visible .polegar {
		outline: 3px solid var(--destaque);
		outline-offset: 2px;
	}

	.rotulos,
	.vaos {
		position: relative;
		height: 1.25rem;
		font-size: 0.8rem;
		color: var(--texto-suave);
	}

	.rotulos span,
	.vaos span {
		position: absolute;
		top: 0;
		white-space: nowrap;
	}

	.rotulos .esq {
		transform: none;
	}

	.rotulos .meio,
	.vaos span {
		transform: translateX(-50%);
	}

	.rotulos .dir {
		transform: translateX(-100%);
	}
</style>
