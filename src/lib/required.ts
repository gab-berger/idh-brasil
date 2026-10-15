/** A value a calculation needs: fails with a message if it is missing (undefined or null in the data). */
export function required<T>(value: T | null | undefined, description: string): T {
	if (value === undefined || value === null) throw new Error(`Missing data: ${description}`);
	return value;
}
