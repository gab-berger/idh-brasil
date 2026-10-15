/**
 * Rolagem da página: o cabeçalho de abas e as sub-abas somem ao descer e voltam ao subir.
 * Um único valor, lido pelos dois cabeçalhos.
 */
export const rolagem = $state({ oculto: false });

/** Começa a acompanhar a rolagem (só no navegador). Devolve a função que para. */
export function observarRolagem(): () => void {
	let ultimo = window.scrollY;
	// Perto do topo, os cabeçalhos sempre aparecem; movimentos pequenos não mudam nada.
	const TOPO = 96;
	const MINIMO = 4;

	function aoRolar(): void {
		const agora = window.scrollY;
		const passo = agora - ultimo;
		ultimo = agora;
		if (agora <= TOPO) rolagem.oculto = false;
		else if (passo > MINIMO) rolagem.oculto = true;
		else if (passo < -MINIMO) rolagem.oculto = false;
	}

	window.addEventListener('scroll', aoRolar, { passive: true });
	return () => window.removeEventListener('scroll', aoRolar);
}
