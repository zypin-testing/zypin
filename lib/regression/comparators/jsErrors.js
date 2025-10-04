/**
 * Attach JavaScript errors data to Playwright test report
 * @param {Object} testInfo - Playwright test info
 * @param {Object} data - Collected JS errors data
 * @param {Object} result - Comparison result
 */
async function attachJsErrorsReport(testInfo, data, result) {
  const errorCount = data.count || 0;
  const errors = data.errors || [];
  
  const summary = `JavaScript Errors: ${errorCount}\n${'-'.repeat(50)}\n`;
  const errorList = errors.length > 0 
    ? errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n\n')
    : '✅ No JavaScript errors detected';
  
  const content = summary + errorList + `\n\nStatus: ${result.passed ? '✅ PASS' : '❌ FAIL'}`;
  
  await testInfo.attach('JS Errors Report', {
    body: content,
    contentType: 'text/plain'
  });
  
  // Also attach as JSON for programmatic access
  await testInfo.attach('JS Errors (JSON)', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json'
  });
}

/**
 * JS Errors comparator - Validate no unexpected JS errors occurred
 * @param {Object} page - Playwright page
 * @param {Object} data - Collected JS errors data
 * @param {Object} config - Collector configuration
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison result
 */
export async function jsErrors(page, data, config, testInfo) {
  const options = config.options || {};
  const allowedPatterns = options.allowedPatterns || [];
  const maxErrors = options.maxErrors !== undefined ? options.maxErrors : 0;
  
  // Filter out allowed errors
  const unexpectedErrors = data.errors.filter(error => {
    const errorStr = typeof error === 'string' ? error : error.message || String(error);
    return !allowedPatterns.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(errorStr);
    });
  });
  
  const passed = unexpectedErrors.length <= maxErrors;
  
  const result = {
    passed,
    status: passed ? 'pass' : 'fail',
    totalErrors: data.count,
    unexpectedErrors: unexpectedErrors.length,
    allowedErrors: data.count - unexpectedErrors.length,
    errors: options.includeErrors ? unexpectedErrors : undefined
  };
  
  // Attach JS errors data to test report
  await attachJsErrorsReport(testInfo, data, result);
  
  return result;
}

