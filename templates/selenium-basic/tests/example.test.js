import { test, By, Key, until } from 'zypin/selenium';

const BASE_URL = 'https://zypin-testing.github.io/zypin-demo-website/';

test('Search Test', async ({ driver }) => {
  await driver.get(BASE_URL)
  await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
  await driver.wait(until.titleIs('webdriver - Google Search'), 1000)
});

