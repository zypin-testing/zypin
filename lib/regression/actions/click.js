/**
 * Click action - Click on an element
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function click(page, context, action) {
  if (!action.selector) {
    throw new Error('Click action requires a "selector" field');
  }

  // Wait for element if timeout specified
  if (action.options?.timeout) {
    await page.locator(action.selector).waitFor({ timeout: action.options.timeout });
  }

  // Click using Playwright native API
  await page.locator(action.selector).click(action.options || {});
}

