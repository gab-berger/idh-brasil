import { readData } from '#lib/data.server';
import type { Source } from '#lib/types';
import type { PageServerLoad } from './$types';

// The sources come from sources.json, read at build time.
export const load: PageServerLoad = () => ({ sources: readData<Source[]>('sources.json') });
