/**
 * Wait for page loaded action - Wait for page to finish loading
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function waitForPageLoaded(page, context, action) {
  const state = action.state || 'networkidle';
  const timeout = action.timeout || 30000;

  // Valid states: 'load', 'domcontentloaded', 'networkidle'
  await page.waitForLoadState(state, { timeout });
}

