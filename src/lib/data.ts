import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';

const cache = new Map<string, Promise<unknown>>();

/**
 * Loads a file from static/data, once. Call it only in the browser (e.g., in onMount): during the build the page
 * is written without data. The caller declares the type T (see types.ts). The JSON is not validated at run time;
 * the data check lives in scripts/prepare_data.py.
 */
export function load<T>(name: string): Promise<T> {
	let request = cache.get(name);
	if (!request) {
		// The data files are generated outside the build, so Kit does not know the path: the cast is deliberate.
		const url = asset(`/data/${name}` as AssetPath);
		request = fetch(url).then((response) => {
			if (!response.ok) throw new Error(`Could not load ${name} (${response.status})`);
			return response.json() as Promise<unknown>;
		});
		cache.set(name, request);
	}
	return request as Promise<T>;
}
