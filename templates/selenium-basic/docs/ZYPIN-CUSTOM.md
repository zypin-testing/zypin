# Zypin Selenium Template - Custom Implementation

**What AI needs to know about Zypin's custom Selenium integration.**

> **Note:** This document ONLY covers Zypin-specific customizations. For standard Selenium WebDriver APIs (driver.findElement, By locators, waits, etc.), refer to official Selenium documentation - AI agents already know this.

---

## 🎯 What is Zypin?

Zypin is a **test runner wrapper** that simplifies test execution across multiple frameworks (Selenium, Playwright, Cucumber). It provides:
- Unified CLI interface
- Template-based project scaffolding
- Auto driver management (no need to `new Builder()` or `driver.quit()`)
- MCP (Model Context Protocol) integration for AI agents

---

## 📦 Import from `zypin/selenium` (NOT selenium-webdriver)

```javascript
// ✅ CORRECT - Zypin import
import { test, expect, By, Key, until } from 'zypin/selenium';

// ❌ WRONG - Direct Selenium import
import { Builder, By, Key, until } from 'selenium-webdriver';
```

**Why?**
- `zypin/selenium` provides the `test()` wrapper function
- Re-exports `By`, `Key`, `until` from selenium-webdriver
- Re-exports `expect` from Chai for assertions
- Ensures compatibility with Zypin's test runner
- `selenium-webdriver` and `chai` are NOT in dependencies - only `zypin` is

**Under the hood:**
```javascript
// zypin/lib/selenium.js
export { By, Key, until } from 'selenium-webdriver';
export { expect } from 'chai';
export { test } from './runner.js';
```

---

## 🧪 Test Structure: `test()` Wrapper

Zypin provides a `test()` function that auto-manages the WebDriver lifecycle.

```javascript
import { test, expect, By } from 'zypin/selenium';

test('Test name', async ({ driver }) => {
  // driver is automatically created from zypin.config.js
  await driver.get('https://example.com');
  const title = await driver.getTitle();
  expect(title).to.equal('Example Domain');
  // driver automatically quits after test
});
```

**Key differences from vanilla Selenium:**
- ✅ No `new Builder()` - driver auto-created
- ✅ No `driver.quit()` - auto-cleanup
- ✅ Test function receives `{ driver }` object
- ✅ Configuration comes from `zypin.config.js`
- ✅ Chai's `expect` included for assertions

**Vanilla Selenium equivalent:**
```javascript
// What you DON'T need to do with Zypin
import { Builder } from 'selenium-webdriver';

async function test() {
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://example.com');
    // ... test code
  } finally {
    await driver.quit();
  }
}
```

---

## ⚙️ Configuration: `zypin.config.js`

Located at project root. This is the ONLY Zypin-specific config file.

### Required Structure

```javascript
export default {
  runner: 'selenium',           // Required: tells Zypin which runner to use
  browser: 'chrome',            // Required: 'chrome' | 'firefox' | 'edge' | 'safari'
  headless: false,              // Optional: show/hide browser (default: false)
  browserArgs: [],              // Optional: browser CLI arguments
  implicitWait: 10000,          // Optional: element timeout in ms (default: 10000)
  pageLoadTimeout: 30000,       // Optional: page load timeout in ms (default: 30000)
  scriptTimeout: 30000          // Optional: script execution timeout in ms (default: 30000)
};
```

### Example Configurations

**Development (Local):**
```javascript
export default {
  runner: 'selenium',
  browser: 'chrome',
  headless: false,              // Show browser
  browserArgs: [
    '--start-maximized',
    '--disable-notifications'
  ],
  implicitWait: 10000,
  pageLoadTimeout: 30000
};
```

**CI/CD:**
```javascript
export default {
  runner: 'selenium',
  browser: 'chrome',
  headless: true,               // Headless for CI
  browserArgs: [
    '--no-sandbox',              // Required for Docker
    '--disable-dev-shm-usage',   // Fix Chrome crashes
    '--disable-gpu'
  ],
  pageLoadTimeout: 60000        // Longer timeout for slow CI
};
```

**Firefox:**
```javascript
export default {
  runner: 'selenium',
  browser: 'firefox',
  headless: true,
  browserArgs: ['-headless']    // Firefox-specific
};
```

**Environment-Based:**
```javascript
export default {
  runner: 'selenium',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.CI === 'true',
  browserArgs: process.env.CI ? ['--no-sandbox'] : ['--start-maximized']
};
```

Run with: `BROWSER=firefox npm test`

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `runner` | `'selenium'` | *required* | Test runner type |
| `browser` | `'chrome'` \| `'firefox'` \| `'edge'` \| `'safari'` | *required* | Browser to use |
| `headless` | `boolean` | `false` | Run in headless mode |
| `browserArgs` | `string[]` | `[]` | Browser command-line arguments |
| `implicitWait` | `number` | `10000` | Element wait timeout (ms) |
| `pageLoadTimeout` | `number` | `30000` | Page load timeout (ms) |
| `scriptTimeout` | `number` | `30000` | Script execution timeout (ms) |
| `reportsDir` | `string` | `'reports'` | Directory for test reports and screenshots |

**Common browserArgs:**
- `--start-maximized` - Start browser maximized
- `--disable-notifications` - Disable browser notifications
- `--no-sandbox` - Required for Docker/CI
- `--disable-gpu` - Disable GPU acceleration
- `--incognito` - Private browsing mode
- `--disable-dev-shm-usage` - Fix Chrome crashes in Docker
- `--window-size=1920,1080` - Set window size

---

## 📊 Test Reporting

Zypin automatically generates test reports after each run:

**Generated Reports:**
- `reports/selenium-junit.xml` - JUnit XML format (for CI/CD integration)
- `reports/selenium-report.json` - Detailed JSON report with all test data
- `reports/screenshots/` - Screenshots captured on test failures

**Report Contents:**
- ✅ Test pass/fail status
- ⏱️ Execution time per test
- ❌ Error messages and stack traces
- 📸 Screenshots on failure (automatic)
- 📊 Summary statistics (total/passed/failed)

**Configure reports directory:**
```javascript
// zypin.config.js
export default {
  runner: 'selenium',
  browser: 'chrome',
  reportsDir: 'reports'  // Change to custom path
};
```

Reports are generated automatically - no additional configuration needed!

---

## 🚀 Running Tests

### Via Zypin CLI

```bash
# From package.json script
npm test

# Direct zypin command
zypin test tests/**/*.test.js
zypin test tests/login.test.js
```

### How It Works

1. Zypin reads `zypin.config.js`
2. Detects `runner: 'selenium'`
3. Finds test files matching the pattern
4. For each test file:
   - Creates WebDriver with config
   - Runs test functions
   - Cleans up driver
5. Reports results

**Source:** `zypin/runners/selenium.js`

---

## 📁 Project Structure

```
my-project/
├── tests/
│   └── example.test.js        # Test files
├── docs/
│   └── ZYPIN-CUSTOM.md        # This file (Zypin-specific docs)
├── zypin.config.js            # Zypin configuration
├── package.json
└── node_modules/
    └── zypin/                 # Contains selenium-webdriver as sub-dependency
```

**Key points:**
- Tests import from `zypin/selenium`
- Only `zypin` is in `dependencies` (not `selenium-webdriver`)
- Configuration is in `zypin.config.js`
- Standard Selenium WebDriver APIs work as-is

---

## 📝 Test File Examples

### Basic Test

```javascript
import { test, expect, By } from 'zypin/selenium';

test('Homepage loads', async ({ driver }) => {
  await driver.get('https://example.com');
  const title = await driver.getTitle();
  expect(title).to.contain('Example');
});
```

### Form Submission

```javascript
import { test, expect, By, until } from 'zypin/selenium';

test('User can login', async ({ driver }) => {
  await driver.get('https://example.com/login');
  
  await driver.findElement(By.id('username')).sendKeys('testuser');
  await driver.findElement(By.id('password')).sendKeys('password123');
  await driver.findElement(By.css('button[type="submit"]')).click();
  
  await driver.wait(until.urlContains('dashboard'), 5000);
  const url = await driver.getCurrentUrl();
  expect(url).to.include('dashboard');
});
```

### Search with Keyboard

```javascript
import { test, expect, By, Key, until } from 'zypin/selenium';

test('Google search', async ({ driver }) => {
  await driver.get('https://www.google.com/ncr');
  
  const searchBox = await driver.findElement(By.name('q'));
  await searchBox.sendKeys('webdriver', Key.RETURN);
  
  await driver.wait(until.titleContains('webdriver'), 5000);
  const title = await driver.getTitle();
  expect(title).to.match(/webdriver/i);
});
```

### Multiple Tests (Each gets fresh driver)

```javascript
import { test, expect, By } from 'zypin/selenium';

test('Test 1', async ({ driver }) => {
  await driver.get('https://example.com');
  const h1 = await driver.findElement(By.css('h1')).getText();
  expect(h1).to.equal('Example Domain');
});

test('Test 2', async ({ driver }) => {
  // Fresh driver instance for Test 2
  await driver.get('https://example.com/other');
  const isDisplayed = await driver.findElement(By.id('content')).isDisplayed();
  expect(isDisplayed).to.be.true;
});
```

---

## ✅ Assertions with Chai

Zypin includes Chai's `expect` API for assertions. Use standard Chai syntax:

```javascript
const title = await driver.getTitle();
expect(title).to.equal('Expected Title');
expect(title).to.contain('Partial');
expect(title).to.match(/regex/i);
```

AI agents already know Chai - all standard Chai assertions work: `.to.equal()`, `.to.contain()`, `.to.be.true`, `.to.have.lengthOf()`, etc.

---

**That's it!** Everything else is standard Selenium WebDriver - AI already knows:
- Locators: `By.css()`, `By.xpath()`, `By.id()`, etc.
- Actions: `click()`, `sendKeys()`, `clear()`, `submit()`
- Waits: `driver.wait()`, `until.elementLocated()`, `until.titleIs()`, etc.
- Navigation: `driver.get()`, `driver.navigate().back()`
- JavaScript: `driver.executeScript()`
- Alerts, frames, windows, cookies - all standard Selenium

---

## 🔧 MCP Integration

Zypin exposes templates and documentation via MCP (Model Context Protocol) for AI agents.

**MCP Resources** (defined in package.json):
```json
{
  "zypin_template": {
    "mcp": {
      "resources": {
        "zypin-custom": {
          "file": "docs/ZYPIN-CUSTOM.md",
          "name": "Zypin Selenium Custom Features",
          "description": "Focused guide on Zypin-specific customizations for Selenium (imports, test structure, config, CLI). Standard Selenium knowledge assumed."
        },
        "example-test": {
          "file": "tests/example.test.js",
          "name": "Example Test File",
          "description": "Sample Selenium test demonstrating proper imports from zypin/selenium"
        },
        "config-example": {
          "file": "zypin.config.js",
          "name": "Zypin Config Example",
          "description": "Zypin configuration file showing runner and browser options"
        }
      }
    }
  }
}
```

**MCP Tools:**
- `zypin_new_project` - Create new project from template
- `zypin_run_tests` - Run tests in project
- `zypin_list_templates` - List available templates

---

## 💡 Key Differences from Standard Selenium

| Aspect | Standard Selenium | Zypin Selenium |
|--------|-------------------|----------------|
| **Import** | `selenium-webdriver` | `zypin/selenium` |
| **Dependencies** | Install `selenium-webdriver` | Install `zypin` only |
| **Driver Setup** | Manual `new Builder()` | Auto-created from config |
| **Configuration** | In test code | `zypin.config.js` file |
| **Cleanup** | Manual `driver.quit()` | Automatic |
| **Test Wrapper** | None (raw functions) | `test()` function |
| **Assertions** | Custom/external library | Chai `expect` included |
| **Run command** | `node test.js` | `zypin test` or `npm test` |
| **APIs** | Standard Selenium | **Identical** - Zypin re-exports everything |

---

## ❓ FAQ

### Q: Can I use standard Selenium documentation?
**A:** Yes! Zypin just wraps the runner. All Selenium WebDriver APIs work identically.

### Q: Why not import from `selenium-webdriver` directly?
**A:** Zypin manages selenium-webdriver as a sub-dependency. Always import from `zypin/selenium`.

### Q: What assertion library does Zypin use?
**A:** Zypin includes Chai's `expect` API. Use `.to.equal()`, `.to.contain()`, `.to.be.true`, etc. See the Assertions section above for examples.

### Q: Can I use a different assertion library?
**A:** Yes, but Chai is already included. You can install and use other libraries like Jest's expect or Node's assert if needed.

### Q: Can I use multiple browsers in one test?
**A:** No. One browser per test file. To test multiple browsers, create separate config files or use environment variables.

### Q: Does Zypin modify Selenium behavior?
**A:** No. Zypin only provides driver lifecycle management and includes Chai for assertions. Test execution is 100% Selenium WebDriver.

### Q: Can I use Selenium IDE recordings?
**A:** Yes, but adapt imports to use `zypin/selenium` instead of `selenium-webdriver`.

### Q: How do I view test reports?
**A:** After running tests, check the `reports/` directory for JUnit XML and JSON reports. Screenshots of failures are in `reports/screenshots/`.

### Q: Can I disable reporting?
**A:** Reports are always generated. You can ignore or delete the `reports/` folder if not needed (it's in `.gitignore` by default).

---

## 🐛 Troubleshooting

### "Cannot find module 'zypin/selenium'"
- Run `npm install` to install zypin dependency

### "Browser not found" or "Driver not found"
- Install browser: Chrome, Firefox, Edge, or Safari
- Install driver: ChromeDriver, GeckoDriver, EdgeDriver
- Add driver to PATH or use webdriver-manager

### Test timeout errors
- Increase timeouts in `zypin.config.js`
- Add explicit waits: `driver.wait(until.elementLocated(...))`
- Verify element selectors are correct

### Chrome crashes in Docker
```javascript
browserArgs: [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu'
]
```

---

## 🎓 Learning Path for AI Agents

1. **Read this doc** - Understand Zypin customizations (5 minutes)
2. **Standard Selenium knowledge** - AI already has this
3. **Done!** - You know everything needed

**External resources:**
- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/webdriver/) - For standard APIs
- [WebDriver Best Practices](https://www.selenium.dev/documentation/test_practices/) - Testing patterns

---

## 🔗 Related Templates

- **playwright-basic** - Playwright with Zypin
- **cucumber-bdd** - BDD/Gherkin with Zypin + Selenium
- **playwright-regression** - Visual regression testing suite

---

## 🎯 Best Practices & Common Pitfalls

### Scroll Before Click (Critical!)

Selenium clicks may fail with `ElementClickInterceptedError` if elements are outside the viewport or covered by sticky headers/footers.

**❌ Bad - Click without scrolling:**
```javascript
const button = await driver.findElement(By.id('submitButton'));
await button.click(); // May fail if button is off-screen
```

**✅ Good - Scroll then click:**
```javascript
const button = await driver.findElement(By.id('submitButton'));
await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', button);
await driver.sleep(300); // Wait for scroll animation
await button.click();
```

**Why `{block: "center"}`?**
- `{block: "center"}` centers the element vertically, avoiding sticky headers/footers
- `{block: "start"}` or `true` may position element under sticky header
- Always add a short `sleep()` after scroll to wait for animation

**When to scroll:**
- Before every `click()` operation
- Before `sendKeys()` if element might be off-screen
- Navigation links at top of page usually don't need scroll

### Handle Alerts Properly

Unhandled alerts will block subsequent test execution with `UnexpectedAlertOpenError`.

**❌ Bad - Ignoring alerts:**
```javascript
await driver.findElement(By.id('deleteButton')).click();
// Alert appears but not handled
// Next command will fail!
```

**✅ Good - Accept or dismiss alerts:**
```javascript
await driver.findElement(By.id('deleteButton')).click();
await driver.sleep(300); // Wait for alert to appear
await driver.switchTo().alert().accept(); // or .dismiss()
```

**Alert methods:**
- `alert().accept()` - Click OK
- `alert().dismiss()` - Click Cancel
- `alert().getText()` - Read alert message
- `alert().sendKeys('text')` - Type in prompt

### Wait for Dynamic Content

Don't use fixed `sleep()` for dynamic content. Use explicit waits.

**❌ Bad - Fixed sleep:**
```javascript
await button.click();
await driver.sleep(5000); // What if it loads in 1s? Or takes 6s?
const result = await driver.findElement(By.id('result')).getText();
```

**✅ Good - Explicit wait:**
```javascript
await button.click();
await driver.wait(until.elementLocated(By.id('result')), 5000);
const result = await driver.findElement(By.id('result')).getText();
```

**Common wait conditions:**
- `until.elementLocated(By.id('foo'))` - Element exists in DOM
- `until.elementIsVisible(element)` - Element is visible
- `until.titleContains('text')` - Page title contains text
- `until.urlContains('path')` - URL contains path

### Form Interactions Best Practices

**Clear before typing:**
```javascript
const input = await driver.findElement(By.id('email'));
await input.clear(); // Clear existing value
await input.sendKeys('new@example.com');
```

**Select dropdowns:**
```javascript
const select = await driver.findElement(By.id('country'));
await select.findElement(By.css('option[value="us"]')).click();
```

**Checkboxes/Radio - Check state first:**
```javascript
const checkbox = await driver.findElement(By.id('terms'));
const isChecked = await checkbox.isSelected();
if (!isChecked) {
  await checkbox.click();
}
```

### Common Error Patterns

| Error | Cause | Solution |
|-------|-------|----------|
| `ElementClickInterceptedError` | Element off-screen or covered | Scroll before click |
| `UnexpectedAlertOpenError` | Alert not handled | Accept/dismiss alert |
| `NoSuchElementError` | Element not found | Check selector, add wait |
| `StaleElementReferenceError` | DOM changed after finding element | Re-find element |
| `TimeoutError` | Element didn't appear in time | Increase timeout or fix selector |

### Performance Tips

**Reuse elements in same context:**
```javascript
const form = await driver.findElement(By.id('loginForm'));
await form.findElement(By.name('username')).sendKeys('user');
await form.findElement(By.name('password')).sendKeys('pass');
// Better than finding from root twice
```

**Batch operations:**
```javascript
// Multiple clicks without waiting
await button1.click();
await button2.click();
await button3.click();
// Then wait for final result
await driver.wait(until.elementLocated(By.id('result')), 5000);
```

---

**Summary:** Zypin is a thin wrapper. Import from `zypin/selenium` (including `test()` and `expect`), configure via `zypin.config.js`, use Chai for assertions, and everything else is standard Selenium WebDriver. **Always scroll before clicking and handle alerts!**

