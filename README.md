# Zypin - The All-in-One Testing Framework

Zypin is a simplified, all-in-one testing framework designed for ease of use and powerful capabilities. It bundles runners for both Playwright and Selenium and includes a full-featured MCP server for AI-powered browser automation.

This project was developed with the assistance of Google's Gemini AI.

## Requirements

- Node.js v18 or newer.

## Features

- **Unified CLI:** A single `zypin` command for all your testing needs.
- **Project Scaffolding:** Quickly create new test projects from built-in templates.
- **Multi-Runner Support:** Out-of-the-box support for both Playwright and Selenium.
- **Integrated Automation Server:** Built-in MCP server for interacting with browsers via AI assistants.

## Installation

### From GitHub (Development)

To install and use the `zypin` command globally from the repository:

```bash
git clone git@github.com:zypin-testing/zypin.git
cd zypin
npm install
npm link
```

### From GitHub (Direct Install)

To install directly from GitHub without cloning:

```bash
npm install -g github:zypin-testing/zypin
```

## Commands

### `zypin update`

Updates zypin to the latest version from GitHub.

**Example:**
```bash
zypin update
```

This command will download and install the latest version of zypin from the GitHub repository.

### `zypin init`

Creates a new test project in the current directory.

**Example:**
```bash
mkdir my-project && cd my-project
zypin init
```

### `zypin scaffold <template-name>`

Adds a testing template to the current project.

**Available Templates:**
- `playwright-basic`
- `playwright-regression`
- `selenium-basic`
- `cucumber-bdd`

**Example:**
```bash
zypin scaffold playwright-basic
zypin scaffold selenium-basic  # Add multiple templates
```

After creating a project, install dependencies and add templates:
```bash
npm install
zypin list                    # See available templates
zypin scaffold playwright-basic  # Add a template
```

### `zypin test <file-pattern>`

Runs tests that match the given file pattern.

This command reads the `runner` specified in the project's `zypin.config.js` to determine how to run the tests.

**Example:**
```bash
# Run a single test file
zypin test tests/login.test.js

# Run all tests in a directory
zypin test "tests/**/*.js"
```

### `zypin mcp`

Starts the unified MCP agent for AI interaction. This server provides **24 tools** for AI assistants:

**Tool Categories:**
- **3 Zypin Tools:** Project management (create, run tests, list templates)
- **21 Browser Tools:** Full browser automation powered by Playwright

**Options:**
- `--headed`: Runs the browser in headed (non-headless) mode.
- `--browser <browser-name>`: Specifies the browser to use (`chromium`, `firefox`, or `webkit`). Defaults to `chromium`.

**Example:**
```bash
zypin mcp --headed --browser firefox
```

#### Browser Automation Tools

The agent includes 21 browser automation tools from playwright-mcp:

**Navigation & Control:**
- `browser_navigate` - Navigate to URLs
- `browser_close` - Close browser/tabs
- `browser_resize` - Resize viewport

**Interaction:**
- `browser_click` - Click elements
- `browser_fill` - Fill form inputs
- `browser_select_option` - Select dropdowns
- `browser_hover` - Hover over elements
- `browser_drag_and_drop` - Drag and drop
- `browser_scroll` - Scroll pages

**Inspection & Debugging:**
- `browser_get_element` - Get element details
- `browser_console_messages` - View console logs
- `browser_screenshot` - Capture screenshots
- `browser_evaluate` - Execute JavaScript

**Advanced:**
- `browser_keyboard_press` - Press keys
- `browser_keyboard_type` - Type text
- `browser_mouse_move` - Move mouse
- `browser_mouse_click` - Mouse operations
- `browser_handle_dialog` - Handle alerts/prompts
- ... and more

**Use Cases:**
- **Pre-test Inspection:** AI can open websites to discover accurate selectors before writing tests
- **Website Auditing:** Check console errors, inspect elements, verify behavior
- **Test Debugging:** Screenshot failures, inspect page state, analyze interactions

## Configuration

Test projects are configured via a `zypin.config.js` file in their root directory.

**Example `zypin.config.js` for Selenium:**
```javascript
export default {
  runner: 'selenium',
  browser: 'chrome',
  // To use a remote Selenium Grid
  // runnerOptions: {
  //   gridUrl: 'http://192.168.1.100:4444/wd/hub'
  // }
};

> **Note:** For local Selenium testing, you must have the appropriate WebDriver for your browser (e.g., `chromedriver` for Chrome) installed and available in your system's PATH.

```

**Example `zypin.config.js` for Playwright:**
```javascript
export default {
  runner: 'playwright',
  runnerOptions: {
    headless: true,
  }
};
```
