/**
 * Set viewport action - Change viewport size dynamically during test
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function setViewport(page, context, action) {
  if (!action.width || !action.height) {
    throw new Error('setViewport action requires "width" and "height" fields');
  }

  // Set viewport using Playwright native API
  await page.setViewportSize({
    width: action.width,
    height: action.height
  });
}

