/**
 * Uncheck action - Uncheck a checkbox
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function uncheck(page, context, action) {
  if (!action.selector) {
    throw new Error('Uncheck action requires a "selector" field');
  }

  // Uncheck using Playwright native API
  await page.locator(action.selector).uncheck(action.options || {});
}

