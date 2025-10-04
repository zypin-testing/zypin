import { expect } from '@playwright/test';

/**
 * Cookies comparator - Compare cookies with baseline using Playwright snapshots
 * @param {Object} page - Playwright page
 * @param {Object} data - Collected cookie data
 * @param {Object} config - Collector configuration
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison result
 */
export async function cookies(page, data, config, testInfo) {
  // Normalize cookies for comparison (exclude volatile fields)
  const normalizeCookies = (cookieList) => {
    return cookieList.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite
      // Exclude: value, expires (volatile)
    })).sort((a, b) => a.name.localeCompare(b.name));
  };
  
  const normalizedCookies = normalizeCookies(data.cookies);
  
  // Generate snapshot name from URL
  const urlPath = new URL(data.url).pathname;
  const snapshotName = `${urlPath}-cookies.json`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-');
  
  try {
    // Use Playwright's built-in snapshot testing
    await expect(normalizedCookies).toMatchSnapshot(snapshotName);
    
    return {
      passed: true,
      status: 'match',
      snapshotName,
      count: data.count
    };
  } catch (error) {
    return {
      passed: false,
      status: 'mismatch',
      snapshotName,
      count: data.count,
      error: error.message
    };
  }
}

