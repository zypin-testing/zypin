/**
 * Cookies collector - Collect browser cookies
 * @param {Object} page - Playwright page
 * @param {Object} config - Collector configuration
 * @returns {Promise<Object>} Cookie data
 */
export async function cookies(page, config) {
  const context = page.context();
  const allCookies = await context.cookies();
  
  return {
    url: page.url(),
    cookies: allCookies,
    count: allCookies.length
  };
}

