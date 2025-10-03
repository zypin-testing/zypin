import { expect } from '@playwright/test';

/**
 * Layout comparator - Visual comparison using Playwright's native toHaveScreenshot
 * @param {Object} page - Playwright page
 * @param {Object} data - Collected screen data
 * @param {Object} config - Collector configuration
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison result
 */
export async function layout(page, data, config, testInfo) {
  const options = config.options || {};
  
  // Generate screenshot name from URL and viewport
  const urlPath = new URL(data.url).pathname;
  const screenshotName = `${urlPath}-${data.viewport.width}x${data.viewport.height}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .concat('.png');
  
  // Use Playwright native screenshot comparison
  const compareOptions = {
    fullPage: options.fullPage !== false,
    maxDiffPixelRatio: options.maxDiffPixelRatio || 0.01,
    timeout: options.timeout || 300000,
    ...options
  };
  
  try {
    await expect(page).toHaveScreenshot(screenshotName, compareOptions);
    return {
      passed: true,
      screenshotName
    };
  } catch (error) {
    return {
      passed: false,
      screenshotName,
      error: error.message
    };
  }
}

