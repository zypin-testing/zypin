import { test, By, Key, until } from 'zypin/selenium';

test('Google Search Test', async ({ driver }) => {
  await driver.get('https://www.google.com/ncr')
  await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
  await driver.wait(until.titleIs('webdriver - Google Search'), 1000)
});

