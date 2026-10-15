import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { numerosAbertura } from '#lib/abertura';
import type { LinhaUf, Pais } from '#lib/tipos';
import type { PageServerLoad } from './$types';

/** Lê um arquivo de dados prontos. O build roda na raiz do projeto, onde fica dados/prontos. */
function lerDados<T>(nome: string): T {
	return JSON.parse(readFileSync(join(process.cwd(), 'dados', 'prontos', nome), 'utf-8')) as T;
}

// Calculado no build: a página de abertura já sai com os números, sem depender de JavaScript.
export const load: PageServerLoad = () => ({
	abertura: numerosAbertura(lerDados<LinhaUf[]>('idhm_uf.json'), lerDados<Pais[]>('paises.json'))
});
