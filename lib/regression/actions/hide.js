/**
 * Hide action - Hide an element by setting display: none
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function hide(page, context, action) {
  if (!action.selector) {
    throw new Error('Hide action requires a "selector" field');
  }

  // Hide element using Playwright native evaluate
  await page.locator(action.selector).evaluate(el => {
    el.style.display = 'none';
  });
}

