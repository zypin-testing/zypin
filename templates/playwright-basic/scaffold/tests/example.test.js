import { test, expect } from 'zypin/playwright';

const BASE_URL = 'https://zypin-testing.github.io/zypin-demo-website/';

test('Hello World Test', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/Zypin Testing Demo/);
});
