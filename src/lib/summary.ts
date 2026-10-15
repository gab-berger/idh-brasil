/** Highlight above the map: the Brazil indicator for the chosen year and measure. */
import { num } from './format';
import { idhmBand } from './scales';
import { t } from './texts';
import type { Measure, StateRow } from './types';

/**
 * "IDH Brasil: 0,805 – muito alto" for the IDHM. The components have no bands, so their highlight shows only the value:
 * "Renda Brasil: 0,760".
 */
export function summaryText(brazil: StateRow, measure: Measure): string {
	if (measure !== 'idhm') return t('highlight.measure', { measure: t(`measure.${measure}`), value: num(brazil[measure]) });
	return t('highlight.idhm', { value: num(brazil.idhm), band: t(`band.${idhmBand(brazil.idhm)}`) });
}
