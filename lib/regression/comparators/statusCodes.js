/**
 * Attach HTTP status codes data to Playwright test report
 * @param {Object} testInfo - Playwright test info
 * @param {Object} data - Collected status codes data
 * @param {Object} result - Comparison result
 */
async function attachStatusCodesReport(testInfo, data, result) {
  const responses = data.responses || [];
  const failedRequests = responses.filter(r => r.status >= 400);
  
  let content = `HTTP Status Codes Report\n${'='.repeat(50)}\n\n`;
  content += `Total Requests: ${responses.length}\n`;
  content += `Failed Requests (4xx/5xx): ${failedRequests.length}\n`;
  content += `Status: ${result.passed ? '✅ PASS' : '❌ FAIL'}\n\n`;
  
  if (failedRequests.length > 0) {
    content += `❌ Failed Requests:\n${'-'.repeat(50)}\n`;
    failedRequests.forEach(req => {
      content += `[${req.status}] ${req.url}\n`;
    });
    content += '\n';
  }
  
  // Show all status codes grouped
  const statusGroups = {};
  responses.forEach(req => {
    const statusRange = `${Math.floor(req.status / 100)}xx`;
    if (!statusGroups[statusRange]) statusGroups[statusRange] = [];
    statusGroups[statusRange].push(req);
  });
  
  content += `Status Code Summary:\n${'-'.repeat(50)}\n`;
  Object.keys(statusGroups).sort().forEach(range => {
    content += `${range}: ${statusGroups[range].length} requests\n`;
  });
  
  await testInfo.attach('HTTP Status Codes', {
    body: content,
    contentType: 'text/plain'
  });
  
  // Attach full data as JSON
  await testInfo.attach('Status Codes (JSON)', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json'
  });
}

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
  
  const result = {
    passed,
    status: passed ? 'pass' : 'fail',
    totalRequests: data.count,
    checkedRequests: relevantResponses.length,
    failedRequests: failedResponses.length,
    failures: options.includeFailures ? failedResponses : undefined
  };
  
  // Attach status codes data to test report
  await attachStatusCodesReport(testInfo, data, result);
  
  return result;
}

