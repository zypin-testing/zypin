/**
 * JS Errors collector - Collect JavaScript console errors
 * Note: This must be set up before page navigation
 * @param {Object} page - Playwright page
 * @param {Object} config - Collector configuration
 * @returns {Promise<Object>} JS errors data
 */
export async function jsErrors(page, config) {
  // Errors are collected via page listeners (set up in runner or test)
  // For now, we collect from page context if available
  const errors = page._jsErrors || [];
  
  return {
    url: page.url(),
    errors,
    count: errors.length
  };
}

