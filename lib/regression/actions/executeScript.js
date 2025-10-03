/**
 * Execute script action - Run JavaScript code on the page
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function executeScript(page, context, action) {
  if (!action.script) {
    throw new Error('executeScript action requires a "script" field');
  }

  // Execute script using Playwright native evaluate
  const result = await page.evaluate(action.script);
  
  return result;
}

