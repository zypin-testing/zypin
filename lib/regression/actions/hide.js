/**
 * Hide action - Hide element(s) by setting display: none
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function hide(page, context, action) {
  if (!action.selector) {
    throw new Error('Hide action requires a "selector" field');
  }

  // Hide all matching elements
  const elements = await page.locator(action.selector).all();
  for (const element of elements) {
    await element.evaluate(el => {
      el.style.display = 'none';
    });
  }
}

