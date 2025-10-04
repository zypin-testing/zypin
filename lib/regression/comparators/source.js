import { expect } from '@playwright/test';

/**
 * Attach HTML source data to Playwright test report
 * @param {Object} testInfo - Playwright test info
 * @param {Object} data - Collected source data
 * @param {Object} result - Comparison result
 */
async function attachSourceReport(testInfo, data, result) {
  const content = data.content || '';
  const contentPreview = content.substring(0, 1000);
  
  let summary = `HTML Source Report\n${'='.repeat(50)}\n\n`;
  summary += `URL: ${data.url}\n`;
  summary += `Content Length: ${content.length} characters\n`;
  summary += `Lines: ${content.split('\n').length}\n`;
  summary += `Status: ${result.passed ? '✅ PASS' : '❌ FAIL'}\n\n`;
  summary += `Preview (first 1000 chars):\n${'-'.repeat(50)}\n`;
  summary += contentPreview;
  summary += content.length > 1000 ? '\n\n... (see full HTML attachment)' : '';
  
  await testInfo.attach('HTML Source Preview', {
    body: summary,
    contentType: 'text/plain'
  });
  
  // Attach full HTML
  await testInfo.attach('HTML Source (Full)', {
    body: content,
    contentType: 'text/html'
  });
}

/**
 * Source comparator - Compare HTML source with baseline using Playwright snapshots
 * @param {Object} page - Playwright page
 * @param {Object} data - Collected source data
 * @param {Object} config - Collector configuration
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison result
 */
export async function source(page, data, config, testInfo) {
  // Generate snapshot name from URL
  const urlPath = new URL(data.url).pathname;
  const snapshotName = `${urlPath}-source.html`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-');
  
  let result;
  
  try {
    // Use Playwright's built-in snapshot testing
    await expect(data.content).toMatchSnapshot(snapshotName);
    
    result = {
      passed: true,
      status: 'match',
      snapshotName
    };
  } catch (error) {
    result = {
      passed: false,
      status: 'mismatch',
      snapshotName,
      error: error.message
    };
  }
  
  // Attach source data to test report
  await attachSourceReport(testInfo, data, result);
  
  return result;
}

