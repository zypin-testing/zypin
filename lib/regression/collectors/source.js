/**
 * Source collector - Collect HTML source code
 * @param {Object} page - Playwright page
 * @param {Object} config - Collector configuration
 * @returns {Promise<Object>} HTML source data
 */
export async function source(page, config) {
  const content = await page.content();
  
  return {
    url: page.url(),
    content,
    length: content.length
  };
}

