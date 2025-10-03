/**
 * Check action - Check a checkbox or radio button
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function check(page, context, action) {
  if (!action.selector) {
    throw new Error('Check action requires a "selector" field');
  }

  // Check using Playwright native API
  await page.locator(action.selector).check(action.options || {});
}

