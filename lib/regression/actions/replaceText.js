/**
 * Replace text action - Replace text content in the page
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function replaceText(page, context, action) {
  if (!action.selector) {
    throw new Error('replaceText action requires a "selector" field');
  }

  if (action.text === undefined) {
    throw new Error('replaceText action requires a "text" field');
  }

  // Replace text content using Playwright native evaluate
  await page.locator(action.selector).evaluate((el, text) => {
    el.textContent = text;
  }, action.text);
}

