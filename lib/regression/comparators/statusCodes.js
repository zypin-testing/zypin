/**
 * Status Codes comparator - Validate HTTP response codes
 * @param {Object} page - Playwright page
 * @param {Object} data - Collected status codes data
 * @param {Object} config - Collector configuration
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison result
 */
export async function statusCodes(page, data, config, testInfo) {
  const options = config.options || {};
  const allowedCodes = options.allowedCodes || [200, 201, 204, 301, 302, 304];
  const ignorePatterns = options.ignorePatterns || [];
  
  // Filter responses based on ignore patterns
  const relevantResponses = data.responses.filter(response => {
    return !ignorePatterns.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(response.url);
    });
  });
  
  // Find failed responses
  const failedResponses = relevantResponses.filter(response => {
    return !allowedCodes.includes(response.status);
  });
  
  const passed = failedResponses.length === 0;
  
  return {
    passed,
    status: passed ? 'pass' : 'fail',
    totalRequests: data.count,
    checkedRequests: relevantResponses.length,
    failedRequests: failedResponses.length,
    failures: options.includeFailures ? failedResponses : undefined
  };
}

