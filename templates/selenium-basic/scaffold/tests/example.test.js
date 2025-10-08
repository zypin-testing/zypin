import { test, expect } from 'zypin/selenium';

const BASE_URL = 'https://zypin-testing.github.io/zypin-demo-website/';

test('Hello World Test', async ({ driver }) => {
  await driver.get(BASE_URL);
  const title = await driver.getTitle();
  expect(title).to.equal('Zypin Testing Demo');
});

