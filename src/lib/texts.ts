import texts from './texts.pt.json';

/** Keys that exist in texts.pt.json. A mistyped key is a type error. */
export type TextKey = keyof typeof texts;

/**
 * Interface text by key. `{name}` in the text is replaced by the value of `vars`.
 * A missing variable is an error, so nothing reaches the screen without being in texts.pt.json.
 */
export function t(key: TextKey, vars: Record<string, string | number> = {}): string {
	const text: string | undefined = texts[key];
	if (text === undefined) throw new Error(`Missing text in texts.pt.json: ${key}`);
	return text.replace(/\{(\w+)\}/g, (_, name: string) => {
		if (!(name in vars)) throw new Error(`Missing variable in ${key}: ${name}`);
		return String(vars[name]);
	});
}
