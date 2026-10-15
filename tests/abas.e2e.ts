import { expect, test } from '@playwright/test';

// Critérios de aceite que dá para checar no navegador: as três abas, o mapa primeiro, o carrossel, o Tocar,
// o limite de linhas da aba Mundo e as perguntas da aba Entenda.

for (const rota of ['/', '/mundo', '/entenda']) {
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

test('no computador, o mapa e o ranking ficam lado a lado', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const mapa = await page.locator('.area-mapa').boundingBox();
	const ranking = await page.locator('.area-ranking').boundingBox();
	expect(mapa).not.toBeNull();
	expect(ranking).not.toBeNull();
	expect(ranking!.x).toBeGreaterThan(mapa!.x + mapa!.width - 1);
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

test('a aba Mundo aceita cinco linhas e avisa na sexta', async ({ page }) => {
	await page.goto('/mundo');
	const linhas = page.locator('#comparacao svg path.linha');
	await expect(linhas).toHaveCount(5);
	await page.locator('button.chip', { hasText: 'Rússia' }).click();
	await expect(linhas).toHaveCount(6);
	await page.locator('button.chip', { hasText: 'Índia' }).click();
	await expect(page.getByRole('status')).toContainText('Até 5 linhas');
});

test('Entenda: as perguntas abrem e fecham', async ({ page }) => {
	await page.goto('/entenda');
	await expect(page.locator('details')).toHaveCount(10);
	await expect(page.locator('details[open]')).toHaveCount(1);
	await page.locator('details').nth(1).locator('summary').click();
	await expect(page.locator('details[open]')).toHaveCount(2);
});
