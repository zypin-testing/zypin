import { expect } from '@playwright/test';

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
  
  try {
    // Use Playwright's built-in snapshot testing
    await expect(data.content).toMatchSnapshot(snapshotName);
    
    return {
      passed: true,
      status: 'match',
      snapshotName
    };
  } catch (error) {
    return {
      passed: false,
      status: 'mismatch',
      snapshotName,
      error: error.message
    };
  }
}

