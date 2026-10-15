/**
 * Page scroll: the top tabs and the sub-tabs hide when the page goes down and come back when it goes up.
 * A single value, read by both headers.
 */
export const scroll = $state({ hidden: false });

/** Starts following the scroll (only in the browser). Returns the function that stops it. */
export function watchScroll(): () => void {
	let last = window.scrollY;
	// Near the top the headers always show; small movements change nothing.
	const TOP = 96;
	const MINIMUM = 4;

	function onScroll(): void {
		const now = window.scrollY;
		const step = now - last;
		last = now;
		if (now <= TOP) scroll.hidden = false;
		else if (step > MINIMUM) scroll.hidden = true;
		else if (step < -MINIMUM) scroll.hidden = false;
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	return () => window.removeEventListener('scroll', onScroll);
}
