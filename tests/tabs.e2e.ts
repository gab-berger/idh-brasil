import { expect, test, type Page } from '@playwright/test';

// Acceptance checks that can be run in the browser: the three pages; the map on the first screen; the header and the
// sub-tabs that hide on scroll down; the chart choice stuck under the header; the order of the controls (sub-tabs,
// title, measures, time); the highlight of Brazil; the state detail in its tab; the rotating analyses; the play
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

test('the Brazil tab order: sub-tabs, title, measure choice, then time', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const subtabs = await page.locator('.subtabs').boundingBox();
	const title = await page.locator('.site-title').boundingBox();
	const measure = await page.locator('.selector').boundingBox();
	const time = await page.locator('.time').boundingBox();
	expect(subtabs!.y).toBeLessThan(title!.y);
	expect(title!.y).toBeLessThan(measure!.y);
	expect(measure!.y).toBeLessThan(time!.y);
});

test('the highlight shows the IDH of Brazil with its band', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('IDH Brasil: 0,805 – muito alto')).toBeVisible();
});

test('choosing a state on the map leads to its detail in the State tab', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Maranhão, IDHM/ }).click();
	await page.getByRole('button', { name: 'Ver detalhes' }).click();
	await expect(page.getByRole('button', { name: 'Estado', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('heading', { name: 'Maranhão' })).toBeVisible();
	await expect(page.getByText('0,745 – alto | 27º / 27 estados')).toBeVisible();
});

test('the sub-tabs switch the view: ranking, regions, state, and back to the map', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await expect(page.locator('#states ol')).toBeVisible();
	await page.getByRole('button', { name: 'Regiões', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Como cada região do Brasil mudou?' })).toBeVisible();
	await page.getByRole('button', { name: 'Estado', exact: true }).click();
	await expect(page.getByText('Escolha um estado para ver os detalhes.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Escolher estado' })).toBeVisible();
	await page.getByRole('button', { name: 'Mapa', exact: true }).click();
	await expect(page.locator('.map svg')).toBeVisible();
});

test('the line legend goes under the chart, and the reading under the legend', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Regiões', exact: true }).click();
	const chart = await page.locator('.area svg').boundingBox();
	const legend = await page.locator('ul.legend').boundingBox();
	const readout = await page.locator('.readout').boundingBox();
	expect(legend!.y).toBeGreaterThan(chart!.y + chart!.height);
	expect(readout!.y).toBeGreaterThan(legend!.y);
});

test('the play button updates the readout of the regions chart, year by year', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Regiões', exact: true }).click();
	await page.getByRole('slider').focus();
	await page.keyboard.press('Home');
	await expect(page.getByText(/^Em 1991:/)).toBeVisible();
	await page.locator('button.play').click();
	await expect(page.getByText(/^Em 2000:/)).toBeVisible({ timeout: 5000 });
	await page.locator('button.play').click();
});

test('the readout of the state chart follows the timeline', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Maranhão, IDHM/ }).click();
	await page.getByRole('button', { name: 'Ver detalhes' }).click();
	await page.locator('.time').getByRole('button', { name: '◀ Anterior' }).click();
	await expect(page.getByText(/^Em 2023:/)).toBeVisible();
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

test('on a wide screen, the state chooser has its title and the select on the same line', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.getByRole('button', { name: 'Estado', exact: true }).click();
	const select = page.getByRole('combobox', { name: 'Escolher estado' });
	await expect(select).toBeVisible();
	const title = await page.getByRole('heading', { name: 'Escolher estado' }).boundingBox();
	const selectBox = await select.boundingBox();
	if (!title || !selectBox) throw new Error('the chooser is not visible');
	expect(Math.abs(title.y + title.height / 2 - (selectBox.y + selectBox.height / 2))).toBeLessThan(8);
});

test('on a 360 px phone, the state chooser has the select under its title', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto('/');
	await page.getByRole('button', { name: 'Estado', exact: true }).click();
	const select = page.getByRole('combobox', { name: 'Escolher estado' });
	await expect(select).toBeVisible();
	const title = await page.getByRole('heading', { name: 'Escolher estado' }).boundingBox();
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
