// Copia os dados prontos para static/dados e recusa seguir se a checagem tiver alguma FALHA.
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const origem = 'dados/prontos';
const destino = 'static/dados';

const checagem = readFileSync(join(origem, 'checagem.txt'), 'utf-8');
const falhas = checagem.split('\n').filter((linha) => linha.startsWith('FALHA'));
if (falhas.length > 0) {
	console.error('checagem.txt tem falhas; corrija os dados antes de gerar o site:');
	console.error(falhas.join('\n'));
	process.exit(1);
}

mkdirSync(destino, { recursive: true });
for (const nome of readdirSync(origem)) {
	if (nome.endsWith('.json') || nome.endsWith('.topojson')) {
		copyFileSync(join(origem, nome), join(destino, nome));
	}
}
console.log(`Dados copiados para ${destino}`);
