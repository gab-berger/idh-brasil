import type { TextKey } from './texts';

export interface Tab {
	/** SvelteKit route, without the base path (links use resolve()). */
	route: '/' | '/mundo' | '/informacoes';
	/** Key in texts.pt.json with the tab's name. */
	key: TextKey;
}

/** The three tabs, in header order. Each one is a page with its own address. */
export const TABS: Tab[] = [
	{ route: '/', key: 'tabs.brazil' },
	{ route: '/mundo', key: 'tabs.world' },
	{ route: '/informacoes', key: 'tabs.information' }
];
