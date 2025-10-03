import { test, expect } from 'zypin/playwright';

const BASE_URL = 'https://zypin-testing.github.io/zypin-demo-website/';

test.describe('Zypin Demo Website - Showcase', () => {
  
  test('navigation and page structure', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Verify page title and main heading
    await expect(page).toHaveTitle(/Zypin Testing Demo/);
    await expect(page.getByRole('heading', { name: 'Welcome to Zypin Testing Demo' })).toBeVisible();
    
    // Test navigation - click the first "Get started" link in nav
    await page.locator('#mainNav').getByRole('link', { name: 'Get started' }).click();
    await expect(page.getByTestId('installation-heading')).toBeVisible();
  });

  test('form interactions with multiple input types', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Fill text inputs
    await page.getByTestId('name-input').fill('John Doe');
    await page.getByTestId('email-input').fill('john@example.com');
    
    // Select checkboxes
    await page.getByTestId('checkbox-playwright').check();
    await page.getByTestId('checkbox-cucumber').check();
    await expect(page.getByTestId('checkbox-playwright')).toBeChecked();
    
    // Select radio button
    await page.getByTestId('radio-intermediate').check();
    await expect(page.getByTestId('radio-intermediate')).toBeChecked();
    
    // Select from dropdown
    await page.getByTestId('country-select').selectOption('vn');
    await expect(page.getByTestId('country-select')).toHaveValue('vn');
  });

  test('interactive elements and dynamic content', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test button clicks
    const clickButton = page.getByTestId('click-button');
    await clickButton.click();
    await expect(page.locator('#clickCount')).toHaveText('1');
    
    // Test double click
    await page.getByTestId('double-click-button').dblclick();
    
    // Test dropdown menu
    await page.locator('#dropdownButton').click();
    await expect(page.getByTestId('menu-option-1')).toBeVisible();
  });

  test('authentication flow with cookies', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Login
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();
    
    // Verify dashboard appears
    await expect(page.getByText('Welcome! You are logged in.')).toBeVisible();
    await expect(page.locator('.stat-card').first()).toBeVisible();
    
    // Logout
    await page.getByTestId('logout-button').click();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('hover interactions and visibility', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test hover card
    const hoverCard = page.getByTestId('hover-card');
    await hoverCard.hover();
    
    // Verify footer is present
    await expect(page.getByTestId('footer')).toBeVisible();
  });

  test('scrolling and element visibility', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll to target element
    const scrollTarget = page.getByTestId('scroll-target');
    await scrollTarget.scrollIntoViewIfNeeded();
    await expect(scrollTarget).toBeVisible();
    
    // Verify content after scrolling
    await expect(scrollTarget.getByRole('heading', { name: 'Scroll Target Element' })).toBeVisible();
  });

  test('search functionality', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test search
    await page.getByTestId('search-input').fill('webdriver');
    await page.getByTestId('search-button').click();
    
    // Verify search results appear
    const searchResults = page.locator('#searchResults');
    await expect(searchResults).not.toBeEmpty();
  });

});
