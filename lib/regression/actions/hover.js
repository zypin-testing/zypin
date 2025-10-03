/**
 * Hover action - Hover over an element
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function hover(page, context, action) {
  if (!action.selector) {
    throw new Error('Hover action requires a "selector" field');
  }

  // Wait for element if timeout specified
  if (action.options?.timeout) {
    await page.locator(action.selector).waitFor({ timeout: action.options.timeout });
  }

  // Hover using Playwright native API
  await page.locator(action.selector).hover(action.options || {});
}

