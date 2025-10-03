/**
 * Scroll action - Scroll to element or position
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function scroll(page, context, action) {
  if (action.selector) {
    // Scroll to element
    await page.locator(action.selector).scrollIntoViewIfNeeded();
  } else if (action.x !== undefined || action.y !== undefined) {
    // Scroll to coordinates
    const x = action.x || 0;
    const y = action.y || 0;
    await page.evaluate(({ x, y }) => {
      window.scrollTo(x, y);
    }, { x, y });
  } else {
    throw new Error('Scroll action requires either "selector" or "x"/"y" coordinates');
  }
}

