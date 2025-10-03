import { test, By, Key, until } from 'zypin/selenium';

const BASE_URL = 'https://zypin-testing.github.io/zypin-demo-website/';

test('Homepage loads successfully', async ({ driver }) => {
  await driver.get(BASE_URL);
  const title = await driver.getTitle();
  console.assert(title === 'Zypin Testing Demo', `Expected title to be 'Zypin Testing Demo', got '${title}'`);
});

test('Search functionality', async ({ driver }) => {
  await driver.get(BASE_URL);
  
  // Fill search input and submit
  const searchInput = await driver.findElement(By.css('[data-testid="search-input"]'));
  await searchInput.sendKeys('webdriver', Key.RETURN);
  
  // Wait for search results to appear
  await driver.wait(until.elementLocated(By.id('searchResults')), 3000);
  const results = await driver.findElement(By.id('searchResults'));
  const resultsText = await results.getText();
  console.assert(resultsText.includes('webdriver'), 'Search results should contain the search term');
});

test('Form interactions', async ({ driver }) => {
  await driver.get(BASE_URL);
  
  // Navigate to examples section
  const examplesLink = await driver.findElement(By.css('a[href="#examples"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', examplesLink);
  await driver.sleep(300);
  await examplesLink.click();
  await driver.sleep(500);
  
  // Fill text inputs
  const nameInput = await driver.findElement(By.css('[data-testid="name-input"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', nameInput);
  await driver.sleep(300);
  await nameInput.sendKeys('John Doe');
  
  const emailInput = await driver.findElement(By.css('[data-testid="email-input"]'));
  await emailInput.sendKeys('john@example.com');
  
  // Select checkboxes
  const seleniumCheckbox = await driver.findElement(By.css('[data-testid="checkbox-selenium"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', seleniumCheckbox);
  await driver.sleep(300);
  await seleniumCheckbox.click();
  
  // Select radio button
  const radioButton = await driver.findElement(By.css('[data-testid="radio-intermediate"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', radioButton);
  await driver.sleep(300);
  await radioButton.click();
  
  // Select dropdown option
  const countrySelect = await driver.findElement(By.css('[data-testid="country-select"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', countrySelect);
  await driver.sleep(300);
  await countrySelect.findElement(By.css('option[value="vn"]')).click();
  
  console.log('Form filled successfully');
});

test('Button clicks and dynamic content', async ({ driver }) => {
  await driver.get(BASE_URL);
  
  // Navigate to examples section
  const examplesLink = await driver.findElement(By.css('a[href="#examples"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', examplesLink);
  await driver.sleep(300);
  await examplesLink.click();
  await driver.sleep(500);
  
  // Click button and verify counter
  const clickButton = await driver.findElement(By.css('[data-testid="click-button"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', clickButton);
  await driver.sleep(300);
  await clickButton.click();
  await clickButton.click();
  await clickButton.click();
  
  const clickCount = await driver.findElement(By.id('clickCount')).getText();
  console.assert(parseInt(clickCount) >= 3, `Expected at least 3 clicks, got ${clickCount}`);
});

test('Authentication flow', async ({ driver }) => {
  await driver.get(BASE_URL);
  
  // Scroll to auth section
  const authSection = await driver.findElement(By.id('auth-section'));
  await driver.executeScript('arguments[0].scrollIntoView(true);', authSection);
  await driver.sleep(500);
  
  // Login
  await driver.findElement(By.css('[data-testid="username-input"]')).sendKeys('testuser');
  await driver.findElement(By.css('[data-testid="password-input"]')).sendKeys('password123');
  
  const loginButton = await driver.findElement(By.css('[data-testid="login-button"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', loginButton);
  await driver.sleep(300);
  await loginButton.click();
  
  // Wait for dashboard to appear
  await driver.wait(until.elementIsVisible(driver.findElement(By.id('dashboard'))), 3000);
  
  // Verify dashboard is visible
  const dashboard = await driver.findElement(By.id('dashboard'));
  const isDisplayed = await dashboard.isDisplayed();
  console.assert(isDisplayed, 'Dashboard should be visible after login');
  
  // Logout
  const logoutButton = await driver.findElement(By.css('[data-testid="logout-button"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', logoutButton);
  await driver.sleep(300);
  await logoutButton.click();
  await driver.sleep(500);
});

test('Dropdown menu interaction', async ({ driver }) => {
  await driver.get(BASE_URL);
  
  // Navigate to examples section
  const examplesLink = await driver.findElement(By.css('a[href="#examples"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', examplesLink);
  await driver.sleep(300);
  await examplesLink.click();
  await driver.sleep(500);
  
  // Scroll to dropdown
  const dropdown = await driver.findElement(By.css('[data-testid="dropdown-menu"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', dropdown);
  await driver.sleep(300);
  
  // Click dropdown button
  const dropdownButton = await driver.findElement(By.id('dropdownButton'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', dropdownButton);
  await driver.sleep(300);
  await dropdownButton.click();
  await driver.sleep(300);
  
  // Click menu option
  const menuOption = await driver.findElement(By.css('[data-testid="menu-option-2"]'));
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', menuOption);
  await driver.sleep(300);
  await menuOption.click();
  
  // Accept alert
  await driver.sleep(300);
  await driver.switchTo().alert().accept();
  
  console.log('Dropdown menu interacted successfully');
});

test('Scroll to element', async ({ driver }) => {
  await driver.get(BASE_URL);
  
  // Scroll to scroll target
  const scrollTarget = await driver.findElement(By.css('[data-testid="scroll-target"]'));
  await driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', scrollTarget);
  await driver.sleep(1000);
  
  // Verify element is visible
  const isDisplayed = await scrollTarget.isDisplayed();
  console.assert(isDisplayed, 'Scroll target should be visible');
});

