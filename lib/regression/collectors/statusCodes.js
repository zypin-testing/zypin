/**
 * Status Codes collector - Collect HTTP response codes
 * Note: This must be set up before page navigation
 * @param {Object} page - Playwright page
 * @param {Object} config - Collector configuration
 * @returns {Promise<Object>} Status codes data
 */
export async function statusCodes(page, config) {
  // Status codes are collected via page listeners (set up in runner)
  const responses = page._responses || [];
  
  return {
    url: page.url(),
    responses: responses.map(r => ({
      url: r.url,
      status: r.status,
      statusText: r.statusText
    })),
    count: responses.length
  };
}

