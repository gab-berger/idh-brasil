import { expect, test, type Page } from '@playwright/test';

// Critérios de aceite que dá para checar no navegador: as três páginas, o mapa na primeira tela, o cabeçalho e as
// sub-abas que somem ao descer, a ordem dos controles (sub-abas, título, medidas, tempo), o destaque do Brasil, o
// detalhe do estado na sua aba, o carrossel, o Tocar, a aba Mundo (destaque, vistas e limite de linhas), as perguntas
// em Informações e a ordem do fim da aba Brasil.

// Altura do cabeçalho, como a folha de estilos a define (em px).
const alturaMenu = (page: Page) =>
	page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--altura-menu')));

for (const rota of ['/', '/mundo', '/informacoes']) {
	for (const largura of [360, 1280]) {
		test(`sem rolagem horizontal: ${rota} em ${largura} px`, async ({ page }) => {
			await page.setViewportSize({ width: largura, height: 800 });
			await page.goto(rota);
			await expect(page.locator('h1')).toBeVisible();
			const sobra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
			expect(sobra).toBeLessThanOrEqual(0);
		});
	}
}

test('no celular, o mapa começa na primeira tela', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const topo = await page.locator('.mapa svg').evaluate((svg) => svg.getBoundingClientRect().top);
	expect(topo).toBeLessThan(844);
});

test('o cabeçalho tem a altura de --altura-menu, 40 px', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const altura = await alturaMenu(page);
	const cabecalho = await page.locator('header.cabecalho').boundingBox();
	expect(altura).toBe(40);
	expect(Math.round(cabecalho!.height)).toBe(altura);
});

test('ao descer a página, o cabeçalho e as sub-abas somem; ao subir, voltam', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.waitForSelector('.mapa svg path');
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	await expect(page.locator('header.cabecalho')).toHaveClass(/oculto/);
	await expect(page.locator('.subabas')).toHaveClass(/oculto/);
	await page.evaluate(() => window.scrollBy(0, -400));
	await expect(page.locator('header.cabecalho')).not.toHaveClass(/oculto/);
	await expect(page.locator('.subabas')).not.toHaveClass(/oculto/);
});

test('a seleção de gráfico fica fixa logo abaixo do cabeçalho; o título rola com a página', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.waitForSelector('.mapa svg path');
	const menu = await alturaMenu(page);
	await page.evaluate(() => window.scrollTo(0, 600));
	await expect(page.locator('.subabas')).toHaveClass(/oculto/);
	await page.evaluate(() => window.scrollBy(0, -200));
	await expect(page.locator('.subabas')).not.toHaveClass(/oculto/);
	// Espera a transição do cabeçalho terminar, para medir onde ele ficou.
	await expect.poll(() => page.locator('.subabas').evaluate((el) => getComputedStyle(el).transform)).toBe('none');
	const subabas = await page.locator('.subabas').boundingBox();
	expect(Math.round(subabas!.y)).toBe(menu);
	await page.evaluate(() => window.scrollTo(0, 900));
	const titulo = await page.locator('.titulo-site').boundingBox();
	expect(titulo!.y).toBeLessThan(menu);
});

test('a ordem da aba Brasil: sub-abas, título, seleção de medida e depois o tempo', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const subabas = await page.locator('.subabas').boundingBox();
	const titulo = await page.locator('.titulo-site').boundingBox();
	const medida = await page.locator('.seletor').boundingBox();
	const tempo = await page.locator('.tempo').boundingBox();
	expect(subabas!.y).toBeLessThan(titulo!.y);
	expect(titulo!.y).toBeLessThan(medida!.y);
	expect(medida!.y).toBeLessThan(tempo!.y);
});

test('o destaque mostra o IDH do Brasil com a classificação', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('IDH Brasil: 0,805 – muito alto')).toBeVisible();
});

test('escolher um estado no mapa leva ao detalhe na aba Estado', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Maranhão, IDHM/ }).click();
	await page.getByRole('button', { name: 'Ver detalhes' }).click();
	await expect(page.getByRole('button', { name: 'Estado', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('heading', { name: 'Maranhão' })).toBeVisible();
	await expect(page.getByText('0,745 – alto | 27º / 27 estados')).toBeVisible();
});

test('as sub-abas trocam a vista: ranking, regiões, estado e volta ao mapa', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await expect(page.locator('#estados ol')).toBeVisible();
	await page.getByRole('button', { name: 'Regiões', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Como cada região do Brasil mudou?' })).toBeVisible();
	await page.getByRole('button', { name: 'Estado', exact: true }).click();
	await expect(page.getByText('Escolha um estado para ver os detalhes.')).toBeVisible();
	await page.getByRole('button', { name: 'Mapa', exact: true }).click();
	await expect(page.locator('.mapa svg')).toBeVisible();
});

test('as análises giram à mão: uma por vez, em ordem', async ({ page }) => {
	await page.goto('/');
	const atual = page.locator('section.analises .analise:not([hidden])');
	await expect(atual).toHaveCount(1);
	await expect(atual.locator('h3')).toHaveText('Qual região mais avançou?');
	await page.locator('section.analises .controles button', { hasText: 'Próxima' }).click();
	await expect(atual.locator('h3')).toHaveText('Os estados ficaram mais parecidos?');
});

test('o botão Tocar liga e desliga a animação', async ({ page }) => {
	await page.goto('/');
	const tocar = page.locator('button.tocar');
	await tocar.click();
	await expect(tocar).toHaveAttribute('aria-pressed', 'true');
	await tocar.click();
	await expect(tocar).toHaveAttribute('aria-pressed', 'false');
});

test('a nota do Censo e da PNAD fica no fim da aba Brasil, e o link para o Mundo é o último item', async ({ page }) => {
	await page.goto('/');
	const analises = await page.locator('section.analises').boundingBox();
	const nota = await page.locator('details.notas').boundingBox();
	const link = await page.getByRole('link', { name: 'Ver o Brasil no mundo →' }).boundingBox();
	expect(nota!.y).toBeGreaterThan(analises!.y);
	expect(link!.y).toBeGreaterThan(nota!.y);
});

test('a aba Mundo mostra o destaque do Brasil em 2023', async ({ page }) => {
	await page.goto('/mundo');
	await expect(page.getByText('IDH global do Brasil em 2023: 0,786 – alto | 84º / 193 países')).toBeVisible();
});

test('a aba Mundo aceita cinco linhas e avisa na sexta', async ({ page }) => {
	await page.goto('/mundo');
	const linhas = page.locator('#comparacao svg path.linha');
	await expect(linhas).toHaveCount(5);
	await page.locator('button.chip', { hasText: 'Rússia' }).click();
	await expect(linhas).toHaveCount(6);
	await page.locator('button.chip', { hasText: 'Índia' }).click();
	await expect(page.getByRole('status')).toContainText('Até 5 linhas');
});

test('a aba Mundo troca a evolução pelo ranking, e volta', async ({ page }) => {
	await page.goto('/mundo');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await expect(page.locator('section[aria-labelledby="ranking-titulo"] li.brasil')).toContainText('Brasil');
	await page.getByRole('button', { name: 'Evolução', exact: true }).click();
	await expect(page.locator('#comparacao svg path.linha').first()).toBeVisible();
});

test('Informações: as perguntas abrem e fecham', async ({ page }) => {
	await page.goto('/informacoes');
	await expect(page.locator('details')).toHaveCount(10);
	await expect(page.locator('details[open]')).toHaveCount(1);
	await page.locator('details').nth(1).locator('summary').click();
	await expect(page.locator('details[open]')).toHaveCount(2);
});
