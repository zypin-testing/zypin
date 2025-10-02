# Writing Custom Step Definitions

This folder is where you create your own custom step definitions to extend the built-in steps provided by Zypin.

## Quick Start

### 1. Create Your Step File

Create a new file in this folder (e.g., `my-custom-steps.js`):

```javascript
import { Given, When, Then } from 'zypin/cucumber';

When('I visit my application', async function() {
  await this.driver.get('https://myapp.com');
});

Then('I should be logged in', async function() {
  const username = await this.driver.findElement({ css: '.user-name' });
  const text = await username.getText();
  if (!text) {
    throw new Error('User is not logged in');
  }
});
```

### 2. Use in Your Feature Files

```gherkin
Feature: Login
  Scenario: User logs in
    When I visit my application
    And I enter "user@example.com" in "#email"
    And I enter "password" in "#password"
    And I click on "#login-btn"
    Then I should be logged in
```

---

## Important Notes

### ⚠️ Import from `zypin/cucumber`

**Always** import from `zypin/cucumber`, **NOT** `@cucumber/cucumber`:

```javascript
// ✅ CORRECT
import { Given, When, Then } from 'zypin/cucumber';

// ❌ WRONG - This package is not in dependencies
import { Given, When, Then } from '@cucumber/cucumber';
```

### 🎯 Access to WebDriver

Your step definitions have access to `this.driver`, which is a Selenium WebDriver instance:

```javascript
When('I do something custom', async function() {
  // this.driver is available
  await this.driver.get('https://example.com');
  
  // Use Selenium WebDriver API
  const element = await this.driver.findElement({ css: '.my-class' });
  await element.click();
  
  // Execute JavaScript
  await this.driver.executeScript('window.scrollTo(0, 0)');
});
```

### 📚 Available Imports

From `zypin/cucumber`, you can import:

- `Given`, `When`, `Then` - Define steps
- `Before`, `After`, `BeforeAll`, `AfterAll` - Hooks
- `setDefaultTimeout`, `setWorldConstructor` - Configuration
- And all other exports from `@cucumber/cucumber`

---

## Examples

### Example 1: Custom Navigation

```javascript
import { Given, When } from 'zypin/cucumber';

Given('I am on the homepage', async function() {
  await this.driver.get('https://myapp.com');
  await this.driver.wait(
    async () => (await this.driver.executeScript('return document.readyState')) === 'complete',
    10000
  );
});

When('I navigate to {string} page', async function(pageName) {
  const urls = {
    'dashboard': '/dashboard',
    'profile': '/profile',
    'settings': '/settings'
  };
  
  const path = urls[pageName.toLowerCase()];
  if (!path) {
    throw new Error(`Unknown page: ${pageName}`);
  }
  
  const currentUrl = await this.driver.getCurrentUrl();
  const baseUrl = new URL(currentUrl).origin;
  await this.driver.get(baseUrl + path);
});
```

### Example 2: Custom Assertions

```javascript
import { Then } from 'zypin/cucumber';
import { By, until } from 'selenium-webdriver';

Then('I should see {int} items in the cart', async function(expectedCount) {
  const cartItems = await this.driver.findElements(By.css('.cart-item'));
  if (cartItems.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} cart items, but found ${cartItems.length}`);
  }
});

Then('the total price should be {string}', async function(expectedPrice) {
  const totalElement = await this.driver.findElement(By.css('.total-price'));
  const actualPrice = await totalElement.getText();
  if (actualPrice !== expectedPrice) {
    throw new Error(`Expected price ${expectedPrice}, but got ${actualPrice}`);
  }
});
```

### Example 3: Using Selenium WebDriver Advanced Features

```javascript
import { When } from 'zypin/cucumber';
import { By, until, Key } from 'selenium-webdriver';

When('I search for {string} with autocomplete', async function(searchTerm) {
  // Type search term
  const searchInput = await this.driver.findElement(By.css('#search'));
  await searchInput.sendKeys(searchTerm);
  
  // Wait for autocomplete dropdown
  await this.driver.wait(
    until.elementLocated(By.css('.autocomplete-dropdown')),
    5000
  );
  
  // Select first suggestion
  await searchInput.sendKeys(Key.ARROW_DOWN);
  await searchInput.sendKeys(Key.RETURN);
});
```

### Example 4: Working with DataTables

```javascript
import { When } from 'zypin/cucumber';
import { By } from 'selenium-webdriver';

When('I fill the registration form:', async function(dataTable) {
  // Feature file:
  // When I fill the registration form:
  //   | field    | value           |
  //   | name     | John Doe        |
  //   | email    | john@example.com|
  
  const rows = dataTable.hashes(); // Convert to array of objects
  
  for (const row of rows) {
    const field = await this.driver.findElement(By.css(`[name="${row.field}"]`));
    await field.sendKeys(row.value);
  }
});
```

---

## Built-in Steps Reference

Zypin provides 100+ built-in step definitions covering:
- **Categories**: Navigation, Clicks, Form Input, Keyboard, Waits, Verifications, Alerts, iFrames, and more
- **Location**: `node_modules/zypin/lib/cucumber/step-definitions/steps.js` (in your project after `npm install`)
- **Total**: 100+ ready-to-use step definitions

### Common Step Patterns:
- Navigation: `Given I navigate to {string}`
- Clicks: `When I click on {string}`
- Input: `When I enter {string} in {string}`
- Assertions: `Then I should see {string} in {string}`
- Waits: `When I wait for {string} to be visible`

> 💡 **Tip**: To see the full list of built-in steps:
> - Open `node_modules/zypin/lib/cucumber/step-definitions/steps.js` in your IDE
> - Or browse on [GitHub](https://github.com/zypin-testing/zypin/blob/main/lib/cucumber/step-definitions/steps.js)
> - Or ask your AI assistant: "What built-in Cucumber steps does Zypin provide?"

---

## Tips & Best Practices

### 1. **Reuse Built-in Steps**

Before writing custom steps, check if built-in steps can handle your case:

```gherkin
# Instead of custom "I login as admin"
When I enter "admin@example.com" in "#email"
And I enter "password" in "#password"
And I click on "#login-btn"
```

### 2. **Make Steps Reusable**

Write generic steps that can be used in multiple scenarios:

```javascript
// ✅ Good - Reusable
When('I select {string} from {string} dropdown', async function(value, dropdownName) {
  // Implementation
});

// ❌ Bad - Too specific
When('I select Standard Shipping from shipping dropdown', async function() {
  // Implementation
});
```

### 3. **Use Descriptive Step Names**

```javascript
// ✅ Good - Clear intent
Then('the order confirmation should be displayed', async function() {
  // ...
});

// ❌ Bad - Vague
Then('check order', async function() {
  // ...
});
```

### 4. **Handle Async Properly**

Always use `async function` and `await`:

```javascript
// ✅ Correct
When('I do something', async function() {
  await this.driver.get('https://example.com');
});

// ❌ Wrong - Missing async/await
When('I do something', function() {
  this.driver.get('https://example.com'); // Will not wait!
});
```

### 5. **Provide Good Error Messages**

```javascript
Then('cart should contain {string}', async function(productName) {
  const products = await this.driver.findElements(By.css('.cart-product-name'));
  const names = await Promise.all(products.map(p => p.getText()));
  
  if (!names.includes(productName)) {
    throw new Error(
      `Product "${productName}" not found in cart. ` +
      `Available products: ${names.join(', ')}`
    );
  }
});
```

---

## Troubleshooting

### Issue: "Cannot find module 'zypin/cucumber'"

**Solution:** Make sure you're importing from `zypin/cucumber`, not `@cucumber/cucumber`. The template only has `zypin` as dependency.

### Issue: "this.driver is undefined"

**Solution:** Make sure you're using regular `function`, not arrow functions:

```javascript
// ✅ Correct
When('I do something', async function() {
  await this.driver.get('...');
});

// ❌ Wrong - Arrow function doesn't bind 'this'
When('I do something', async () => {
  await this.driver.get('...'); // this.driver will be undefined
});
```

### Issue: Step not recognized in feature file

**Solution:** 
1. Make sure your step file is in `step-definitions/` folder
2. Check that step pattern matches exactly (including quotes and parameters)
3. Restart test run to pick up new step files

---

## More Resources

- Selenium WebDriver Docs: https://www.selenium.dev/documentation/webdriver/
- Cucumber Expressions: https://github.com/cucumber/cucumber-expressions
- Zypin Repository: https://github.com/zypin-testing/zypin

Happy testing! 🚀

