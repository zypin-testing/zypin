/**
 * Wait for element action - Wait for element to be visible
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function waitForElement(page, context, action) {
  if (!action.selector) {
    throw new Error('waitForElement action requires a "selector" field');
  }

  const options = {
    state: action.state || 'visible',
    timeout: action.timeout || 30000
  };

  // Wait using Playwright native API
  await page.locator(action.selector).waitFor(options);
}

