/**
 * Select action - Select option from dropdown
 * @param {Object} page - Playwright page
 * @param {Object} context - Playwright context  
 * @param {Object} action - Action configuration
 */
export async function select(page, context, action) {
  if (!action.selector) {
    throw new Error('Select action requires a "selector" field');
  }

  if (!action.value && !action.label && !action.index) {
    throw new Error('Select action requires one of: "value", "label", or "index"');
  }

  const locator = page.locator(action.selector);

  // Select by value, label, or index using Playwright native API
  if (action.value !== undefined) {
    await locator.selectOption({ value: action.value });
  } else if (action.label !== undefined) {
    await locator.selectOption({ label: action.label });
  } else if (action.index !== undefined) {
    await locator.selectOption({ index: action.index });
  }
}

