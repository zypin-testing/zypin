/**
 * Attach performance metrics data to Playwright test report
 * @param {Object} testInfo - Playwright test info
 * @param {Object} data - Collected performance data
 * @param {Object} result - Comparison result
 */
async function attachPerformanceReport(testInfo, data, result) {
  const metrics = data.metrics || {};
  
  let content = `Performance Metrics\n${'='.repeat(50)}\n\n`;
  content += `URL: ${data.url}\n`;
  content += `Status: ${result.passed ? '✅ PASS' : '❌ FAIL'}\n\n`;
  
  // Paint metrics
  if (metrics.firstPaint || metrics.firstContentfulPaint) {
    content += `🎨 Paint Metrics:\n${'-'.repeat(50)}\n`;
    if (metrics.firstPaint) {
      content += `First Paint: ${metrics.firstPaint.toFixed(2)}ms\n`;
    }
    if (metrics.firstContentfulPaint) {
      content += `First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms\n`;
    }
    content += '\n';
  }
  
  // Navigation timing
  if (metrics.navigation) {
    content += `⚡ Navigation Timing:\n${'-'.repeat(50)}\n`;
    content += `DOM Content Loaded: ${metrics.navigation.domContentLoaded.toFixed(2)}ms\n`;
    content += `Load Complete: ${metrics.navigation.loadComplete.toFixed(2)}ms\n`;
    content += `DOM Interactive: ${metrics.navigation.domInteractive.toFixed(2)}ms\n`;
    content += `Total Duration: ${metrics.navigation.duration.toFixed(2)}ms\n`;
    content += '\n';
  }
  
  // Resources
  if (metrics.resourceCount) {
    content += `📦 Resources:\n${'-'.repeat(50)}\n`;
    content += `Total Resources Loaded: ${metrics.resourceCount}\n`;
    content += '\n';
  }
  
  // Memory
  if (metrics.memory) {
    content += `💾 Memory Usage:\n${'-'.repeat(50)}\n`;
    content += `Used JS Heap: ${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
    content += `Total JS Heap: ${(metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
  }
  
  await testInfo.attach('Performance Metrics', {
    body: content,
    contentType: 'text/plain'
  });
  
  await testInfo.attach('Performance (JSON)', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json'
  });
}

/**
 * Performance comparator - Validate performance metrics
 * @param {Object} page - Playwright page
 * @param {Object} data - Collected performance data
 * @param {Object} config - Collector configuration
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison result
 */
export async function performance(page, data, config, testInfo) {
  const options = config.options || {};
  const thresholds = options.thresholds || {};
  
  // For now, performance collector just collects data without strict validation
  // In the future, this could validate against performance budgets
  const result = {
    passed: true, // Performance data collection always passes
    status: 'collected',
    metrics: data.metrics,
    url: data.url
  };
  
  // Attach performance data to test report
  await attachPerformanceReport(testInfo, data, result);
  
  return result;
}
