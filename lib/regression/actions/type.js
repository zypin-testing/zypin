/**
 * Type action - Fill input fields with text
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function type(page, context, action) {
  if (!action.selector) {
    throw new Error('Type action requires a "selector" field');
  }
  
  if (action.text === undefined) {
    throw new Error('Type action requires a "text" field');
  }

  // Use Playwright native fill method
  await page.locator(action.selector).fill(action.text, action.options || {});
}

