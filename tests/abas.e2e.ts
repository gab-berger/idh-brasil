import { expect, test } from '@playwright/test';

// Critérios de aceite que dá para checar no navegador: as três abas, o mapa primeiro, as sub-abas, a ficha ao
// lado do mapa no computador, o carrossel, o Tocar, o limite de linhas da aba Mundo e as perguntas da aba Entenda.

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

test('no computador, a ficha do estado fica ao lado do mapa', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const mapa = await page.locator('.mapa svg').boundingBox();
	const ficha = await page.locator('aside.ficha').boundingBox();
	expect(mapa).not.toBeNull();
	expect(ficha).not.toBeNull();
	expect(ficha!.x).toBeGreaterThan(mapa!.x + mapa!.width - 1);
});

test('as sub-abas trocam a vista: ranking, evolução das regiões e volta ao mapa', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Ranking', exact: true }).click();
	await expect(page.locator('#estados ol')).toBeVisible();
	await page.getByRole('button', { name: 'Evolução das regiões' }).click();
	await expect(page.getByRole('heading', { name: 'Como cada região do Brasil mudou?' })).toBeVisible();
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
