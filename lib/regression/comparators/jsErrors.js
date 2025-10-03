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
  
  return {
    passed,
    status: passed ? 'pass' : 'fail',
    totalErrors: data.count,
    unexpectedErrors: unexpectedErrors.length,
    allowedErrors: data.count - unexpectedErrors.length,
    errors: options.includeErrors ? unexpectedErrors : undefined
  };
}

