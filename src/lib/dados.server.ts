import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Lê um arquivo de dados prontos durante o build. O build roda na raiz do projeto, onde fica dados/prontos. */
export function lerDados<T>(nome: string): T {
	return JSON.parse(readFileSync(join(process.cwd(), 'dados', 'prontos', nome), 'utf-8')) as T;
}
