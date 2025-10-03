// This is a global registry for tests defined with our custom runner.
global.ZypinSeleniumTests = [];

// Re-export the necessary parts from the real selenium-webdriver package
export { By, Key, until } from 'selenium-webdriver';

// Re-export Chai's expect for assertions
export { expect } from 'chai';

/**
 * Registers a test to be run by the Zypin selenium runner.
 * @param {string} name The name of the test.
 * @param {(args: {driver: import('selenium-webdriver').WebDriver}) => Promise<void>} fn The test function.
 */
export function test(name, fn) {
  global.ZypinSeleniumTests.push({ name, fn });
}
