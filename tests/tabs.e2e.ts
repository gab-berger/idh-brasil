import { expect, test, type Page } from '@playwright/test';

// Acceptance checks that can be run in the browser: the three pages; the map on the first screen; the header and the
// sub-tabs that hide on scroll down; the chart choice stuck under the header; the order of the controls (sub-tabs,
// title, measures, time); the highlight of Brazil; the evolution tab (no time control, the comparison of regions and
// states, the detail of the place in focus, and their order on a phone and on a wide screen); the rotating analyses; the play
// button; the readout under the charts; the world tab (highlight, evolution, ranking with Brazil pinned to the
// edge, year, observations, line limit); the questions on the information page; and the order at the end of the
// Brazil tab. The text checked is the Portuguese copy on the screen.

// Height of the header, as the stylesheet defines it (in px).
const headerHeight = (page: Page) =>
	page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')));

for (const route of ['/', '/mundo', '/informacoes']) {
	for (const width of [360, 1280]) {
		test(`no horizontal scroll: ${route} at ${width} px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 800 });
			await page.goto(route);
			await expect(page.locator('h1')).toBeVisible();
			const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
			expect(overflow).toBeLessThanOrEqual(0);
		});
	}
}

for (const width of [360, 1280]) {
	test(`no horizontal scroll: evolution tab at ${width} px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('/');
		await page.getByRole('button', { name: 'Evolução', exact: true }).click();
		await expect(page.locator('#compare svg path.line').first()).toBeVisible();
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
		expect(overflow).toBeLessThanOrEqual(0);
	});
}

test('on a phone, the map starts on the first screen', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const top = await page.locator('.map svg').evaluate((svg) => svg.getBoundingClientRect().top);
	expect(top).toBeLessThan(844);
});

test('the header is as tall as --header-height, 40 px', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const height = await headerHeight(page);
	const header = await page.locator('header.header').boundingBox();
	expect(height).toBe(40);
	expect(Math.round(header!.height)).toBe(height);
});

test('the chart choice sticks to the header, with no empty space', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.waitForSelector('.map svg path');
	const menu = await headerHeight(page);
	const subtabs = await page.locator('.subtabs').boundingBox();
	expect(Math.round(subtabs!.y)).toBe(menu);
});

test('scrolling down hides the header and the sub-tabs; scrolling up brings them back', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.waitForSelector('.map svg path');
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	await expect(page.locator('header.header')).toHaveClass(/hidden/);
	await expect(page.locator('.subtabs')).toHaveClass(/hidden/);
	await page.evaluate(() => window.scrollBy(0, -400));
	await expect(page.locator('header.header')).not.toHaveClass(/hidden/);
	await expect(page.locator('.subtabs')).not.toHaveClass(/hidden/);
});

test('the chart choice stays fixed right under the header; the title scrolls with the page', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.waitForSelector('.map svg path');
	const menu = await headerHeight(page);
	await page.evaluate(() => window.scrollTo(0, 600));
	await expect(page.locator('.subtabs')).toHaveClass(/hidden/);
	await page.evaluate(() => window.scrollBy(0, -200));
	await expect(page.locator('.subtabs')).not.toHaveClass(/hidden/);
	// Wait for the header transition to finish, so the position measured is the final one.
	await expect.poll(() => page.locator('.subtabs').evaluate((el) => getComputedStyle(el).transform)).toBe('none');
	const subtabs = await page.locator('.subtabs').boundingBox();
	expect(Math.round(subtabs!.y)).toBe(menu);
	await page.evaluate(() => window.scrollTo(0, 900));
	const title = await page.locator('.site-title').boundingBox();
	expect(title!.y).toBeLessThan(menu);
});

test('the Brazil tab order: sub-tabs, measure choice right under them, title, then time', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const tabs = await page.locator('.subtabs .tabs').boundingBox();
	const measure = await page.locator('.subtabs .selector').boundingBox();
	const title = await page.locator('.site-title').boundingBox();
	const time = await page.locator('.time').boundingBox();
	expect(measure!.y).toBeGreaterThanOrEqual(tabs!.y + tabs!.height - 1);
	expect(title!.y).toBeGreaterThan(measure!.y + measure!.height - 1);
	expect(time!.y).toBeGreaterThan(title!.y);
});

for (const view of ['Mapa', 'Ranking', 'Evolução']) {
	test(`${view}: the header, the sub-tabs and the measure leave and come back together`, async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.getByRole('button', { name: view, exact: true }).click();
		await expect(page.locator('.subtabs .selector')).toBeVisible();
		const rows = async () => ({
			header: await page.locator('header.header').evaluate((el) => el.getBoundingClientRect().bottom),
			tabs: await page.locator('.subtabs .tabs').evaluate((el) => el.getBoundingClientRect().bottom),
			measure: await page.locator('.subtabs .selector').evaluate((el) => el.getBoundingClientRect().bottom)
		});
		const shown = await rows();
		expect(shown.header).toBeGreaterThan(0);
		expect(shown.tabs).toBeGreaterThan(shown.header);
		expect(shown.measure).toBeGreaterThan(shown.tabs);
		await page.evaluate(() => window.scrollTo(0, 700));
		await expect(page.locator('.subtabs')).toHaveClass(/hidden/);
		await expect(page.locator('header.header')).toHaveClass(/hidden/);
		await expect.poll(async () => Object.values(await rows()).every((bottom) => bottom <= 0)).toBe(true);
		await page.evaluate(() => window.scrollBy(0, -200));
		// They come back to the place they had, all three (the poll waits for the end of the 200 ms movement).
		await expect
			.poll(async () => {
				const back = await rows();
				return [Math.round(back.header), Math.round(back.tabs), Math.round(back.measure)];
			})
			.toEqual([Math.round(shown.header), Math.round(shown.tabs), Math.round(shown.measure)]);
	});
}

test('with the keyboard focus on the header or the rows, all of them stay on the screen together', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.waitForSelector('.map svg path');
	await page.evaluate(() => window.scrollTo(0, 700));
	await expect(page.locator('.subtabs')).toHaveClass(/hidden/);
	await page.keyboard.press('Tab');
	const bottom = (selector: string) => page.locator(selector).evaluate((el) => el.getBoundingClientRect().bottom);
	await expect.poll(() => bottom('header.header')).toBeGreaterThan(0);
	await expect.poll(() => bottom('.subtabs .selector')).toBeGreaterThan(0);
});

test('a mouse click on a button does not keep the header and the rows from hiding on scroll', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.waitForSelector('.map svg path');
	await page.locator('.subtabs .selector').getByRole('button', { name: 'Renda' }).click();
	await page.evaluate(() => window.scrollTo(0, 700));
	await expect(page.locator('.subtabs')).toHaveClass(/hidden/);
	await expect.poll(() => page.locator('.subtabs .selector').evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
	await expect.poll(() => page.locator('header.header').evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
});

test('the highlight shows the IDH of Brazil with its band', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('IDH Brasil: 0,805 – muito alto')).toBeVisible();
});

test('choosing a state on the map leads to its detail in the evolution tab', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Maranhão, IDHM/ }).click();
	await page.getByRole('button', { name: 'Ver detalhes' }).click();
	await expect(page.getByRole('button', { name: 'Evolução', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('heading', { name: 'Maranhão' })).toBeVisible();
	await expect(page.getByText('IDHM em 2024: 0,745 – alto | 27º / 27 estados')).toBeVisible();
});

test('the sub-tabs switch the view: ranking, evolution, and back to the map', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await expect(page.locator('#states ol')).toBeVisible();
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Como as regiões e os estados mudaram?' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Escolher região ou estado' })).toBeVisible();
	await page.getByRole('button', { name: 'Mapa', exact: true }).click();
	await expect(page.locator('.map svg')).toBeVisible();
});

test('the line legend goes under the chart, and the reading under the legend', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	const chart = await page.locator('#compare .area svg').boundingBox();
	const legend = await page.locator('#compare ul.legend').boundingBox();
	const readout = await page.locator('#compare .readout').boundingBox();
	expect(legend!.y).toBeGreaterThan(chart!.y + chart!.height);
	expect(readout!.y).toBeGreaterThan(legend!.y);
});

test('the evolution tab has no time control and no animation', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.time')).toHaveCount(1);
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	await expect(page.locator('#compare svg path.line').first()).toBeVisible();
	await expect(page.locator('.time')).toHaveCount(0);
	await expect(page.getByRole('slider')).toHaveCount(0);
	await expect(page.locator('button.play')).toHaveCount(0);
});

test('the evolution tab opens with Brazil in focus, and both charts read 2024 until the pointer moves', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Brasil', exact: true })).toBeVisible();
	await expect(page.getByText('IDHM em 2024: 0,805 – muito alto')).toBeVisible();
	await expect(page.locator('#compare .readout')).toContainText('Em 2024:');
	await expect(page.locator('.detail .readout')).toContainText('Em 2024: IDHM 0,805');
});

test('the comparison opens with Brazil and the five regions; each line stops before 2011 and starts again after it', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	await expect(page.locator('#compare svg path.line')).toHaveCount(12);
	const legend = page.locator('#compare ul.legend li');
	await expect(legend).toHaveText(['Brasil', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']);
});

test('in the line selector, the regions are bold and the states are not', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	const weight = (text: RegExp) =>
		page.locator('#compare button.chip', { hasText: text }).evaluate((el) => getComputedStyle(el).fontWeight);
	for (const region of [/^Nordeste$/, /^Sul$/]) expect(await weight(region)).toBe('700');
	expect(await weight(/^MA$/)).toBe('400');
	// A region turned off is still bold; a state turned on is not as bold as a region.
	await page.locator('#compare button.chip', { hasText: /^Sul$/ }).click();
	expect(await weight(/^Sul$/)).toBe('700');
	await page.locator('#compare button.chip', { hasText: /^MA$/ }).click();
	expect(await weight(/^MA$/)).toBe('600');
});

test('the line selector: regions in alphabetical order, each followed by its states, only with the codes', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	const chips = page.locator('#compare button.chip');
	await expect(chips).toHaveText([
		'Centro-Oeste', 'DF', 'GO', 'MT', 'MS',
		'Nordeste', 'AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE',
		'Norte', 'AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO',
		'Sudeste', 'ES', 'MG', 'RJ', 'SP',
		'Sul', 'PR', 'RS', 'SC'
	]);
	await expect(page.locator('#compare button.chip', { hasText: /^MA$/ })).toHaveAttribute('aria-label', 'Maranhão (MA)');
});

test('the comparison takes five lines besides Brazil, warns on the sixth, and a freed color goes to the new line', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	// The legend has one item for each line; the drawing has two paths for each, because of the gap in 2011.
	const lines = page.locator('#compare ul.legend li');
	await expect(lines).toHaveCount(6);
	await page.locator('#compare button.chip', { hasText: /^MA$/ }).click();
	await expect(page.getByRole('status')).toContainText('Até 5 linhas');
	await expect(lines).toHaveCount(6);
	await page.locator('#compare button.chip', { hasText: /^Sul$/ }).click();
	await expect(lines).toHaveCount(5);
	await page.locator('#compare button.chip', { hasText: /^MA$/ }).click();
	await expect(lines).toHaveCount(6);
	await expect(page.locator('#compare svg path.line')).toHaveCount(12);
	await expect(page.locator('#compare ul.legend li').last()).toHaveText('MA');
	await expect(page.locator('#compare button.chip', { hasText: /^MA$/ })).toHaveAttribute('aria-pressed', 'true');
});

test('the measure choice changes the comparison, not the detail, which shows the four indicators', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	await page.locator('.subtabs .selector').getByRole('button', { name: 'Educação' }).click();
	await expect(page.locator('#compare .readout')).toContainText('Brasil 0,798');
	await expect(page.locator('.detail ul.legend li')).toHaveText(['IDHM', 'Longevidade', 'Educação', 'Renda']);
});

test('choosing a region or a state in the focus changes the detail', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	const select = page.getByRole('combobox', { name: 'Escolher região ou estado' });
	await select.selectOption({ label: 'Nordeste' });
	await expect(page.getByRole('heading', { name: 'Nordeste', level: 2 })).toBeVisible();
	await expect(page.getByText('IDHM em 2024: 0,761 – alto | 5º / 5 regiões')).toBeVisible();
	await select.selectOption({ label: 'Sergipe' });
	await expect(page.getByRole('heading', { name: 'Sergipe' })).toBeVisible();
	await expect(page.locator('.detail .highlight')).toContainText('/ 27 estados');
	await select.selectOption({ label: 'Brasil' });
	await expect(page.getByText('IDHM em 2024: 0,805 – muito alto')).toBeVisible();
});

test('the first analysis leads to the evolution tab with the leading region in focus', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ver as regiões' }).click();
	await expect(page.getByRole('button', { name: 'Evolução', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('heading', { name: 'Nordeste', level: 2 })).toBeVisible();
	await expect(page.getByRole('combobox', { name: 'Escolher região ou estado' })).toHaveValue('region:NE');
});

test('on a phone, the comparison chart comes first, and the detail comes under it', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	const compare = await page.locator('#compare .area svg').boundingBox();
	const detail = await page.locator('.detail .area svg').boundingBox();
	const choose = await page.getByRole('combobox', { name: 'Escolher região ou estado' }).boundingBox();
	if (!compare || !detail || !choose) throw new Error('the charts are not visible');
	expect(compare.y).toBeLessThan(844);
	expect(compare.y).toBeLessThan(choose.y);
	expect(choose.y).toBeLessThan(detail.y);
	expect(detail.y).toBeGreaterThan(compare.y + compare.height);
});

test('on a wide screen, the comparison is fixed on the right half and the detail is on the left', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	const compare = page.locator('#compare');
	await expect(compare.locator('svg path.line').first()).toBeVisible();
	const detail = page.locator('.detail');
	await expect(detail).toBeVisible();
	const before = await compare.boundingBox();
	const detailBox = await detail.boundingBox();
	if (!before || !detailBox) throw new Error('the charts are not visible');
	expect(before.x).toBeGreaterThan(640);
	expect(detailBox.x + detailBox.width).toBeLessThan(660);
	// The chart stays on the screen while the left half scrolls.
	await page.evaluate(() => window.scrollTo(0, 300));
	const chart = page.locator('#compare .area svg');
	await expect.poll(async () => (await chart.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
	const after = await chart.boundingBox();
	expect(after!.y + after!.height).toBeLessThanOrEqual(800);
});

test('the analyses rotate by hand: one at a time, in order', async ({ page }) => {
	await page.goto('/');
	const current = page.locator('section.analysis .item:not([hidden])');
	await expect(current).toHaveCount(1);
	await expect(current.locator('h3')).toHaveText('Qual região mais avançou?');
	await page.locator('section.analysis .controls button', { hasText: 'Próxima' }).click();
	await expect(current.locator('h3')).toHaveText('Os estados ficaram mais parecidos?');
});

test('the play button turns the animation on and off', async ({ page }) => {
	await page.goto('/');
	const play = page.locator('button.play');
	await play.click();
	await expect(play).toHaveAttribute('aria-pressed', 'true');
	await play.click();
	await expect(play).toHaveAttribute('aria-pressed', 'false');
});

test('the Censo and PNAD note is at the end of the Brazil tab, and the link to the world tab is the last item', async ({ page }) => {
	await page.goto('/');
	const analysis = await page.locator('section.analysis').boundingBox();
	const note = await page.locator('details.notes').boundingBox();
	const link = await page.getByRole('link', { name: 'Ver o Brasil no mundo →' }).boundingBox();
	expect(note!.y).toBeGreaterThan(analysis!.y);
	expect(link!.y).toBeGreaterThan(note!.y);
});

test('the world tab shows the highlight of Brazil in 2023', async ({ page }) => {
	await page.goto('/mundo');
	await expect(page.getByText('IDH global do Brasil em 2023: 0,786 – alto | 84º / 193 países')).toBeVisible();
});

test('the world tab takes five lines and warns on the sixth', async ({ page }) => {
	await page.goto('/mundo');
	const lines = page.locator('#compare svg path.line');
	await expect(lines).toHaveCount(5);
	await page.locator('button.chip', { hasText: 'Rússia' }).click();
	await expect(lines).toHaveCount(6);
	await page.locator('button.chip', { hasText: 'Índia' }).click();
	await expect(page.getByRole('status')).toContainText('Até 5 linhas');
});

test('the world tab switches between the evolution and the ranking, and back', async ({ page }) => {
	await page.goto('/mundo');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await expect(page.locator('.box li.brazil')).toContainText('Brasil');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	await expect(page.locator('#compare svg path.line').first()).toBeVisible();
});

test('the world ranking lists every country, with Brazil in the middle of the list', async ({ page }) => {
	await page.goto('/mundo');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await expect(page.locator('.box li')).toHaveCount(193);
	const box = await page.locator('.box').boundingBox();
	const brazil = await page.locator('.box li.brazil').boundingBox();
	expect(Math.abs(brazil!.y + brazil!.height / 2 - (box!.y + box!.height / 2))).toBeLessThan(40);
});

test('Brazil stays pinned to the edge of the list: at the bottom before reaching it, at the top after passing it', async ({ page }) => {
	await page.goto('/mundo');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	const box = page.locator('.box');
	const brazil = page.locator('.box li.brazil');
	// At the top of the list, Brazil has not been reached yet: it stays pinned to the bottom edge of the box.
	await box.evaluate((el) => (el.scrollTop = 0));
	await expect
		.poll(async () => {
			const c = await box.boundingBox();
			const b = await brazil.boundingBox();
			return Math.abs(c!.y + c!.height - (b!.y + b!.height));
		})
		.toBeLessThanOrEqual(3);
	// At the end of the list, Brazil has already been passed: it stays pinned to the top edge.
	await box.evaluate((el) => (el.scrollTop = el.scrollHeight));
	await expect
		.poll(async () => {
			const c = await box.boundingBox();
			const b = await brazil.boundingBox();
			return Math.abs(b!.y - c!.y - 1);
		})
		.toBeLessThanOrEqual(3);
});

test('the year selection changes the list and the title', async ({ page }) => {
	await page.goto('/mundo');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await page.getByLabel('Ano').selectOption('2010');
	await expect(page.getByRole('heading', { name: 'Posição no ranking de 2010' })).toBeVisible();
	await expect(page.getByText('países com dado em 2010')).toBeVisible();
});

test('the observations of the world tab are an expandable section, with bold titles', async ({ page }) => {
	await page.goto('/mundo');
	const observations = page.locator('details.observations');
	await expect(observations).not.toHaveAttribute('open', '');
	await observations.locator('summary').click();
	await expect(observations).toHaveAttribute('open', '');
	const titles = observations.locator('dt');
	await expect(titles).toHaveText(['Fonte', 'Médias', 'BRICS', 'IDHM e IDH']);
	expect(await titles.first().evaluate((el) => getComputedStyle(el).fontWeight)).toBe('600');
});

test('the evolution of Brazil comes in analysis blocks, as in the Brazil tab', async ({ page }) => {
	await page.goto('/mundo');
	const current = page.locator('section.analysis .item:not([hidden])');
	await expect(current).toHaveCount(1);
	await expect(current.locator('h3')).toHaveText('Qual o ritmo do Brasil em relação ao mundo?');
	await page.locator('section.analysis .controls button', { hasText: 'Próxima' }).click();
	await expect(current.locator('h3')).toHaveText('Quais grupos o Brasil superou no crescimento?');
});

test('Information: the questions open and close', async ({ page }) => {
	await page.goto('/informacoes');
	await expect(page.locator('details')).toHaveCount(12);
	await expect(page.locator('details[open]')).toHaveCount(1);
	await page.locator('details').nth(1).locator('summary').click();
	await expect(page.locator('details[open]')).toHaveCount(2);
});

test('Information: the questions go from the most asked to the most specific, and the bands are a table', async ({
	page
}) => {
	await page.goto('/informacoes');
	await expect(page.locator('details summary h2')).toHaveText([
		'O que é o IDH?',
		'O que é o IDHM?',
		'O que significam as faixas?',
		'O que medem a Longevidade, a Educação e a Renda?',
		'Por que o valor do Brasil é diferente nas abas Brasil e Mundo?',
		'Por que alguns anos não têm dado?',
		'O que o IDH não mostra?',
		'De onde vêm os dados?',
		'Como as três dimensões viram um número só?',
		'Como são calculadas as médias?',
		'Como funcionam as posições no ranking?',
		'O que é o BRICS original?'
	]);
	await expect(page.locator('details[open] summary h2')).toHaveText('O que é o IDH?');
	await page.getByText('O que significam as faixas?').click();
	const bands = page.getByRole('table', { name: 'Faixas do IDHM e do IDH global' });
	await expect(bands.locator('tbody tr')).toHaveCount(5);
	await expect(bands.getByRole('row', { name: /médio/ })).toContainText('0,600 a 0,699');
	await expect(bands.getByRole('row', { name: /médio/ })).toContainText('0,550 a 0,699');
});

test('the theme button switches between light and dark, and keeps the choice after a reload', async ({ page }) => {
	await page.goto('/');
	const toggle = page.getByRole('button', { name: 'Tema escuro' });
	await expect(toggle).toHaveAttribute('aria-pressed', 'false');
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(18, 20, 23)');
	await page.reload();
	await expect(page.getByRole('button', { name: 'Tema escuro' })).toHaveAttribute('aria-pressed', 'true');
	await page.getByRole('button', { name: 'Tema escuro' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('on a 360 px phone, the header tabs and the theme button do not overlap', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto('/');
	const boxes = await page.locator('header nav a').evaluateAll((links) =>
		links.map((link) => {
			const box = link.getBoundingClientRect();
			return { left: box.left, right: box.right };
		})
	);
	const theme = await page.getByRole('button', { name: 'Tema escuro' }).boundingBox();
	for (let i = 1; i < boxes.length; i++) {
		expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i - 1].right - 1);
	}
	expect(boxes[boxes.length - 1].right).toBeLessThanOrEqual(theme!.x + 1);
	const overflowing = await page.locator('header nav a').evaluateAll((links) =>
		links.filter((link) => link.scrollWidth > link.clientWidth + 1).map((link) => link.textContent?.trim())
	);
	expect(overflowing).toEqual([]);
});

test('an address that does not exist shows the error page, in Portuguese', async ({ page }) => {
	await page.goto('/pagina-que-nao-existe');
	await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Voltar ao início' })).toBeVisible();
});

test('on a wide screen, the focus chooser has its title and the select on the same line', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	const select = page.getByRole('combobox', { name: 'Escolher região ou estado' });
	await expect(select).toBeVisible();
	const title = await page.getByRole('heading', { name: 'Escolher região ou estado' }).boundingBox();
	const selectBox = await select.boundingBox();
	if (!title || !selectBox) throw new Error('the chooser is not visible');
	expect(Math.abs(title.y + title.height / 2 - (selectBox.y + selectBox.height / 2))).toBeLessThan(8);
});

test('on a 360 px phone, the focus chooser has the select under its title', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto('/');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	const select = page.getByRole('combobox', { name: 'Escolher região ou estado' });
	await expect(select).toBeVisible();
	const title = await page.getByRole('heading', { name: 'Escolher região ou estado' }).boundingBox();
	const selectBox = await select.boundingBox();
	if (!title || !selectBox) throw new Error('the chooser is not visible');
	expect(selectBox.y).toBeGreaterThan(title.y + title.height - 1);
});

test('on a wide screen, the two groups of lines stay on the left half, one above the other', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/mundo');
	const averages = page.getByRole('heading', { name: 'Médias', exact: true });
	await expect(averages).toBeVisible();
	const countries = page.getByRole('heading', { name: 'Países', exact: true });
	const averagesBox = await averages.boundingBox();
	const countriesBox = await countries.boundingBox();
	if (!averagesBox || !countriesBox) throw new Error('the groups are not visible');
	expect(averagesBox.x + averagesBox.width).toBeLessThan(640);
	expect(countriesBox.x + countriesBox.width).toBeLessThan(640);
	expect(countriesBox.y).toBeGreaterThan(averagesBox.y + averagesBox.height);
});

test('on a 360 px phone, the two groups of lines in the world tab are stacked', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto('/mundo');
	const averages = page.getByRole('heading', { name: 'Médias', exact: true });
	await expect(averages).toBeVisible();
	const countries = page.getByRole('heading', { name: 'Países', exact: true });
	const averagesBox = await averages.boundingBox();
	const countriesBox = await countries.boundingBox();
	if (!averagesBox || !countriesBox) throw new Error('the groups are not visible');
	expect(countriesBox.y).toBeGreaterThan(averagesBox.y + averagesBox.height);
});

test('on a wide screen, the world ranking list is on the right half and its year on the left', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/mundo');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	const year = page.getByLabel('Ano');
	await expect(year).toBeVisible();
	const list = page.getByRole('region', { name: /Países no ranking de/ });
	await expect(list).toBeVisible();
	const yearBox = await year.boundingBox();
	const listBox = await list.boundingBox();
	if (!yearBox || !listBox) throw new Error('the ranking is not visible');
	expect(yearBox.x + yearBox.width).toBeLessThan(640);
	expect(listBox.x).toBeGreaterThan(640);
});

test('the world ranking does not make the page longer than its content', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/mundo');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await expect(page.locator('.box li').first()).toBeVisible();
	const height = await page.evaluate(() => document.documentElement.scrollHeight);
	expect(height).toBeLessThan(1500);
});

test('on a wide screen, the map is on the right half and stays on the screen while the text scrolls', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.goto('/');
	const map = page.locator('.map');
	await expect(map).toBeVisible();
	const before = await map.boundingBox();
	if (!before) throw new Error('the map is not visible');
	expect(before.x).toBeGreaterThan(640);
	await page.evaluate(() => window.scrollTo(0, 400));
	await expect.poll(async () => (await map.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
	const after = await map.boundingBox();
	if (!after) throw new Error('the map is not visible after scrolling');
	expect(after.y + after.height).toBeLessThanOrEqual(720);
});
