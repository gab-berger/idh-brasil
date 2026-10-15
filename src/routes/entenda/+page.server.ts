import { lerDados } from '#lib/dados.server';
import type { Fonte } from '#lib/tipos';
import type { PageServerLoad } from './$types';

// As fontes vêm de fontes.json, lido no build.
export const load: PageServerLoad = () => ({ fontes: lerDados<Fonte[]>('fontes.json') });
