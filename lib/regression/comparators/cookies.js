import { expect } from '@playwright/test';

/**
 * Attach cookies data to Playwright test report
 * @param {Object} testInfo - Playwright test info
 * @param {Object} data - Collected cookie data
 * @param {Object} result - Comparison result
 */
async function attachCookiesReport(testInfo, data, result) {
  const cookies = data.cookies || [];
  
  let content = `Cookies Report\n${'='.repeat(50)}\n\n`;
  content += `Total Cookies: ${cookies.length}\n`;
  content += `Status: ${result.passed ? '✅ PASS' : '❌ FAIL'}\n\n`;
  
  if (cookies.length > 0) {
    cookies.forEach((cookie, idx) => {
      content += `${idx + 1}. ${cookie.name}\n`;
      content += `   Value: ${cookie.value}\n`;
      content += `   Domain: ${cookie.domain}\n`;
      content += `   Path: ${cookie.path}\n`;
      content += `   Secure: ${cookie.secure}\n`;
      content += `   HttpOnly: ${cookie.httpOnly}\n`;
      content += '\n';
    });
  } else {
    content += '🍪 No cookies found\n';
  }
  
  await testInfo.attach('Cookies Report', {
    body: content,
    contentType: 'text/plain'
  });
  
  await testInfo.attach('Cookies (JSON)', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json'
  });
}

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
  
  let result;
  
  try {
    // Use Playwright's built-in snapshot testing
    await expect(normalizedCookies).toMatchSnapshot(snapshotName);
    
    result = {
      passed: true,
      status: 'match',
      snapshotName,
      count: data.count
    };
  } catch (error) {
    result = {
      passed: false,
      status: 'mismatch',
      snapshotName,
      count: data.count,
      error: error.message
    };
  }
  
  // Attach cookies data to test report
  await attachCookiesReport(testInfo, data, result);
  
  return result;
}

