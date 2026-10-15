// Copies the ready data files to static/data, where the app loads them in the browser.
// It stops the build if the check report has a failure (a line starting with FAIL).
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = 'data/ready';
const target = 'static/data';

const checks = readFileSync(join(source, 'checks.txt'), 'utf-8');
const failures = checks.split('\n').filter((line) => line.startsWith('FAIL'));
if (failures.length > 0) {
	console.error('checks.txt has failures; fix the data before building the site:');
	console.error(failures.join('\n'));
	process.exit(1);
}

mkdirSync(target, { recursive: true });
for (const name of readdirSync(source)) {
	if (name.endsWith('.json') || name.endsWith('.topojson')) {
		copyFileSync(join(source, name), join(target, name));
	}
}
console.log(`Data copied to ${target}`);
