# Zypin Playwright Template - Custom Implementation

**What AI needs to know about Zypin's custom Playwright integration.**

> **Note:** This document ONLY covers Zypin-specific customizations. For standard Playwright APIs (page.goto, locators, assertions, etc.), refer to official Playwright documentation - AI agents already know this.

---

## 🎯 What is Zypin?

Zypin is a **test runner wrapper** that simplifies test execution across multiple frameworks (Playwright, Selenium, Cucumber). It provides:
- Unified CLI interface
- Template-based project scaffolding
- MCP (Model Context Protocol) integration for AI agents

---

## 📦 Import from `zypin/playwright` (NOT @playwright/test)

```javascript
// ✅ CORRECT - Zypin import
import { test, expect } from 'zypin/playwright';

// ❌ WRONG - Direct Playwright import
import { test, expect } from '@playwright/test';
```

**Why?** 
- `zypin/playwright` re-exports everything from `@playwright/test`
- Ensures compatibility with Zypin's test runner
- `@playwright/test` is NOT in dependencies - only `zypin` is

**Under the hood:**
```javascript
// zypin/lib/playwright.js
export * from '@playwright/test';
```

---

## ⚙️ Configuration: `zypin.config.js`

Located at project root. This is the ONLY Zypin-specific config file.

### Structure

```javascript
export default {
  runner: 'playwright',  // Required: tells Zypin which runner to use
  cliArgs: []            // Optional: Playwright CLI arguments
};
```

### Example Configurations

**Development:**
```javascript
export default {
  runner: 'playwright',
  cliArgs: [
    '--headed',           // Show browser
    '--reporter', 'list', // Console output
  ]
};
```

**CI/CD:**
```javascript
export default {
  runner: 'playwright',
  cliArgs: [
    '--workers', '4',                // Parallel execution
    '--retries', '2',                // Retry failures
    '--reporter', 'html',            // HTML report
    '--reporter', 'junit',           // JUnit XML
    '--trace', 'retain-on-failure',  // Debug traces
  ]
};
```

**Common CLI Args:**
- `--headed` - Show browser UI
- `--workers N` - Parallel workers
- `--retries N` - Retry failures
- `--reporter NAME` - Add reporter (html, junit, list, json, dot, line)
- `--trace on|retain-on-failure` - Record traces
- `--project NAME` - Run specific project
- `--grep PATTERN` - Filter tests
- `--update-snapshots` - Update visual baselines

**Full list:** See [Playwright CLI docs](https://playwright.dev/docs/test-cli) - standard Playwright, not Zypin-specific.

### Advanced: playwright.config.js

For advanced Playwright features (multi-browser, fixtures, etc.), create standard `playwright.config.js`:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Standard Playwright configuration
  // See: https://playwright.dev/docs/test-configuration
});
```

Both files can coexist. Zypin will use both.

---

## 🚀 Running Tests

### Via Zypin CLI

```bash
# From package.json script
npm test

# Direct zypin command
zypin test "tests/**/*.test.js"
zypin test "tests/login.test.js"
```

### How It Works

1. Zypin reads `zypin.config.js`
2. Detects `runner: 'playwright'`
3. Finds test files matching the pattern
4. Spawns Playwright CLI: `node @playwright/test/cli test [files] [cliArgs]`
5. Passes through all output (stdio: inherit)

**Source:** `zypin/runners/playwright.js`

```javascript
// Simplified version of how Zypin runs Playwright
import { spawn } from 'child_process';
import { glob } from 'glob';

export async function run(filePattern, config, options = {}) {
  const files = await glob(filePattern, { cwd: options.cwd });
  const args = ['@playwright/test/cli', 'test', ...files];
  
  if (config.cliArgs) {
    args.push(...config.cliArgs);
  }
  
  spawn('node', args, { stdio: 'inherit', cwd: options.cwd });
}
```

---

## 📁 Project Structure

```
my-project/
├── tests/
│   └── example.test.js        # Test files
├── docs/
│   └── ZYPIN-CUSTOM.md        # This file (Zypin-specific docs)
├── zypin.config.js            # Zypin configuration
├── playwright.config.js       # (Optional) Advanced Playwright config
├── package.json
└── node_modules/
    └── zypin/                 # Contains Playwright as sub-dependency
```

**Key points:**
- Tests import from `zypin/playwright`
- Only `zypin` is in `dependencies` (not `@playwright/test`)
- Configuration is in `zypin.config.js`
- Standard Playwright patterns work as-is

---

## 📝 Test File Structure

```javascript
// tests/example.test.js
import { test, expect } from 'zypin/playwright';

const BASE_URL = 'https://zypin-testing.github.io/zypin-demo-website/';

test('Hello World Test', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/Zypin Testing Demo/);
});
```

**That's it!** Everything else is standard Playwright - AI already knows:
- Locators: `page.getByRole()`, `page.getByText()`, etc.
- Actions: `click()`, `fill()`, `selectOption()`, etc.
- Assertions: `expect(page).toHaveTitle()`, `expect(locator).toBeVisible()`, etc.
- Fixtures: `{ page, context, browser, request }`
- Hooks: `test.beforeEach()`, `test.afterEach()`
- Page Objects, API testing, visual regression - all standard Playwright

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
          "name": "Zypin Playwright Custom Features",
          "description": "Focused guide on Zypin-specific customizations for Playwright (imports, config, CLI). Standard Playwright knowledge assumed."
        },
        "example-test": {
          "file": "tests/example.test.js",
          "name": "Example Test File",
          "description": "Sample Playwright test demonstrating proper imports from zypin/playwright"
        },
        "config-example": {
          "file": "zypin.config.js",
          "name": "Zypin Config Example",
          "description": "Zypin configuration file showing runner and cliArgs structure"
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

## 💡 Key Differences from Standard Playwright

| Aspect | Standard Playwright | Zypin Playwright |
|--------|---------------------|------------------|
| **Import** | `@playwright/test` | `zypin/playwright` |
| **Dependencies** | Install `@playwright/test` | Install `zypin` only |
| **Configuration** | `playwright.config.js` | `zypin.config.js` (simpler) |
| **Run command** | `npx playwright test` | `zypin test` or `npm test` |
| **CLI args** | Pass directly | Configure in `cliArgs` array |
| **APIs** | Standard Playwright | **Identical** - Zypin re-exports everything |

---

## ❓ FAQ

### Q: Can I use standard Playwright documentation?
**A:** Yes! Zypin just wraps the runner. All Playwright APIs work identically.

### Q: Can I use `playwright.config.js`?
**A:** Yes! Use it for advanced features. It works alongside `zypin.config.js`.

### Q: Why not import from `@playwright/test` directly?
**A:** Zypin manages Playwright as a sub-dependency. Always import from `zypin/playwright`.

### Q: Can I use Playwright plugins?
**A:** Yes! Install them and configure in `playwright.config.js` as usual.

### Q: Does Zypin modify Playwright behavior?
**A:** No. Zypin only provides a CLI wrapper. Test execution is 100% Playwright.

---

## 🎓 Learning Path for AI Agents

1. **Read this doc** - Understand Zypin customizations (5 minutes)
2. **Standard Playwright knowledge** - AI already has this
3. **Done!** - You know everything needed

**External resources:**
- [Playwright Official Docs](https://playwright.dev) - For standard APIs
- [Playwright CLI Reference](https://playwright.dev/docs/test-cli) - For CLI args

---

## 🔗 Related Templates

- **selenium-basic** - Selenium WebDriver with Zypin
- **cucumber-bdd** - BDD/Gherkin with Zypin + Selenium
- **playwright-regression** - Visual regression testing suite

---

**Summary:** Zypin is a thin wrapper. Import from `zypin/playwright`, configure via `zypin.config.js`, everything else is standard Playwright.

