import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import edge from 'selenium-webdriver/edge.js';
import path from 'path';
import { glob } from 'glob';
import fs from 'fs-extra';
import { SeleniumReporter } from '../lib/selenium-reporter.js';

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
    await import(`${testFilePath}?v=${Math.random()}`);
  }

  if (global.ZypinSeleniumTests.length === 0) {
    console.log('No tests were registered. Make sure to use the `test()` function from `zypin/selenium`.');
    return;
  }

  // Initialize reporter
  const reportsDir = config.reportsDir || 'reports';
  const reporter = new SeleniumReporter({ ...config, reportsDir });
  reporter.init('Selenium Test Suite');

  let driver;
  let passedCount = 0;
  let failedCount = 0;

  try {
    const browser = config.browser || 'chrome';
    console.log(`Starting Selenium driver (${browser})...`);
    
    // Create driver using shared function
    driver = await createSeleniumDriver(config);

    // Run tests
    for (const test of global.ZypinSeleniumTests) {
      console.log(`Running test: ${test.name}`);
      const testInfo = reporter.startTest(test.name);
      
      try {
        await test.fn({ driver });
        reporter.passTest(testInfo);
        console.log(`✓ ${test.name} passed`);
        passedCount++;
      } catch (error) {
        // Capture screenshot on failure
        let screenshotPath = null;
        try {
          const screenshotsDir = path.join(reportsDir, 'screenshots');
          await fs.ensureDir(screenshotsDir);
          const timestamp = Date.now();
          const filename = `${test.name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.png`;
          screenshotPath = path.join(screenshotsDir, filename);
          const screenshot = await driver.takeScreenshot();
          await fs.writeFile(screenshotPath, screenshot, 'base64');
          console.log(`  Screenshot saved: ${screenshotPath}`);
        } catch (screenshotError) {
          console.log(`  Warning: Could not capture screenshot: ${screenshotError.message}`);
        }
        
        reporter.failTest(testInfo, error, screenshotPath);
        console.log(`✗ ${test.name} failed`);
        console.log(`  Error: ${error.message}`);
        failedCount++;
      }
    }

    // Generate reports
    await reporter.generateReports();
    reporter.printSummary();

    // Exit with error code if any tests failed
    if (failedCount > 0) {
      process.exitCode = 1;
    }

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
