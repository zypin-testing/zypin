/**
 * Screen collector - Collects screenshot metadata
 * (Actual screenshot is handled by comparator using Playwright native API)
 * @param {Object} page - Playwright page
 * @param {Object} config - Collector configuration
 * @returns {Promise<Object>} Screenshot metadata
 */
export async function screen(page, config) {
  const options = config.options || {};
  
  return {
    url: page.url(),
    title: await page.title(),
    viewport: page.viewportSize(),
    options: {
      fullPage: options.fullPage !== false, // Default to true
      ...options
    }
  };
}

