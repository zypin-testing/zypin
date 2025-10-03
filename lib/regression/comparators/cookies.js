import fs from 'fs-extra';
import path from 'path';

/**
 * Cookies comparator - Compare cookies with baseline
 * @param {Object} page - Playwright page
 * @param {Object} data - Collected cookie data
 * @param {Object} config - Collector configuration
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison result
 */
export async function cookies(page, data, config, testInfo) {
  const options = config.options || {};
  const baselineDir = options.baselineDir || 'baselines/cookies';
  
  // Generate baseline filename
  const urlPath = new URL(data.url).pathname;
  const baselineName = `${urlPath}-cookies.json`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-');
  
  const baselinePath = path.join(baselineDir, baselineName);
  
  // Create baseline directory if it doesn't exist
  await fs.ensureDir(baselineDir);
  
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
  
  // Check if baseline exists
  if (!await fs.pathExists(baselinePath)) {
    // Create new baseline
    await fs.writeJson(baselinePath, normalizedCookies, { spaces: 2 });
    return {
      passed: true,
      status: 'baseline-created',
      baselineName,
      count: data.count
    };
  }
  
  // Read existing baseline
  const baseline = await fs.readJson(baselinePath);
  
  // Compare
  const baselineStr = JSON.stringify(baseline);
  const currentStr = JSON.stringify(normalizedCookies);
  
  if (baselineStr === currentStr) {
    return {
      passed: true,
      status: 'match',
      baselineName,
      count: data.count
    };
  }
  
  return {
    passed: false,
    status: 'mismatch',
    baselineName,
    expected: baseline.length,
    actual: normalizedCookies.length
  };
}

