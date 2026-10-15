import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Reads a ready data file during the build. The build runs at the project root, where data/ready is. */
export function readData<T>(name: string): T {
	return JSON.parse(readFileSync(join(process.cwd(), 'data', 'ready', name), 'utf-8')) as T;
}
