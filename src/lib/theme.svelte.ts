/**
 * Light or dark theme. Without a choice, the page follows the system; once the reader chooses, the choice is kept
 * in this browser. The inline script in app.html applies a saved choice before the first paint.
 */
const KEY = 'idh-brasil:theme';

export const theme = $state({ dark: false });

/** The saved choice: 'dark', 'light', or null when the reader has not chosen yet. */
function savedChoice(): string | null {
	try {
		return window.localStorage.getItem(KEY);
	} catch {
		return null;
	}
}

/** Reads the theme in effect: the saved choice, or else the system preference. */
export function syncTheme(): void {
	const saved = savedChoice();
	theme.dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Turns the dark theme on or off, and keeps the choice in this browser. */
export function setTheme(dark: boolean): void {
	theme.dark = dark;
	document.documentElement.dataset.theme = dark ? 'dark' : 'light';
	try {
		window.localStorage.setItem(KEY, dark ? 'dark' : 'light');
	} catch {
		// Without storage, the choice lasts only for this visit.
	}
}
