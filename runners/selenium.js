import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import edge from 'selenium-webdriver/edge.js';
import path from 'path';
import { glob } from 'glob';

export async function run(filePattern, config, options = {}) {
  const cwd = options.cwd || process.cwd();
  const files = await glob(filePattern, { cwd });

  if (files.length === 0) {
    console.log(`No tests found for pattern: ${filePattern}`);
    return;
  }

  // Initialize the global test registry
  global.ZypinSeleniumTests = [];

  // Import all test files. This will have the side effect of populating the registry.
  for (const file of files) {
    const testFilePath = path.resolve(cwd, file);
    await import(testFilePath);
  }

  if (global.ZypinSeleniumTests.length === 0) {
    console.log('No tests were registered. Make sure to use the `test()` function from `zypin/selenium`.');
    return;
  }

  let driver;
  try {
    const browser = config.browser || 'chrome';
    console.log(`Starting Selenium driver (${browser})...`);
    
    // Create driver using shared function
    driver = await createSeleniumDriver(config);

    // Run tests
    for (const test of global.ZypinSeleniumTests) {
      console.log(`Running test: ${test.name}`);
      await test.fn({ driver });
      console.log(`✓ ${test.name} passed`);
    }

    console.log(`All tests finished. ${global.ZypinSeleniumTests.length} passed.`);

  } finally {
    if (driver) {
      console.log('Closing Selenium driver...');
      await driver.quit();
    }
    // Clean up the global registry
    delete global.ZypinSeleniumTests;
  }
}

/**
 * Creates a Selenium WebDriver with configuration
 * Reusable by both selenium runner and cucumber
 * @param {Object} config - Configuration object
 * @returns {Promise<import('selenium-webdriver').WebDriver>}
 */
export async function createSeleniumDriver(config) {
  const browser = config.browser || 'chrome';
  
  let builder = new Builder().forBrowser(browser);
  
  // Configure browser-specific options (headless, args)
  const browserOptions = getBrowserOptions(browser, config);
  if (browserOptions) {
    switch (browser.toLowerCase()) {
      case 'chrome':
        builder = builder.setChromeOptions(browserOptions);
        break;
      case 'firefox':
        builder = builder.setFirefoxOptions(browserOptions);
        break;
      case 'edge':
        builder = builder.setEdgeOptions(browserOptions);
        break;
    }
  }
  
  const driver = await builder.build();
  
  // Configure timeouts if specified
  if (config.implicitWait || config.pageLoadTimeout || config.scriptTimeout) {
    const timeouts = {};
    if (config.implicitWait) timeouts.implicit = config.implicitWait;
    if (config.pageLoadTimeout) timeouts.pageLoad = config.pageLoadTimeout;
    if (config.scriptTimeout) timeouts.script = config.scriptTimeout;
    await driver.manage().setTimeouts(timeouts);
  }
  
  return driver;
}

/**
 * Get browser-specific options based on configuration
 * Supports HIGH PRIORITY features: headless mode, browser args
 */
export function getBrowserOptions(browser, config) {
  switch (browser.toLowerCase()) {
    case 'chrome':
      const chromeOptions = new chrome.Options();
      
      // Headless mode
      if (config.headless) {
        chromeOptions.addArguments('--headless=new');
      }
      
      // Custom browser arguments
      if (config.browserArgs && Array.isArray(config.browserArgs)) {
        chromeOptions.addArguments(...config.browserArgs);
      }
      
      return chromeOptions;
      
    case 'firefox':
      const firefoxOptions = new firefox.Options();
      
      // Headless mode
      if (config.headless) {
        firefoxOptions.addArguments('-headless');
      }
      
      // Custom browser arguments
      if (config.browserArgs && Array.isArray(config.browserArgs)) {
        firefoxOptions.addArguments(...config.browserArgs);
      }
      
      return firefoxOptions;
      
    case 'edge':
      const edgeOptions = new edge.Options();
      
      // Headless mode
      if (config.headless) {
        edgeOptions.addArguments('--headless=new');
      }
      
      // Custom browser arguments
      if (config.browserArgs && Array.isArray(config.browserArgs)) {
        edgeOptions.addArguments(...config.browserArgs);
      }
      
      return edgeOptions;
      
    default:
      return null;
  }
}
