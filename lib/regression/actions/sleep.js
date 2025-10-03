/**
 * Sleep action - Wait for a specified duration
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function sleep(page, context, action) {
  if (!action.duration) {
    throw new Error('Sleep action requires a "duration" field (in milliseconds)');
  }

  // Use Playwright native waitForTimeout
  await page.waitForTimeout(action.duration);
}

