import { diffLines } from 'diff';
import fs from 'fs-extra';
import path from 'path';

/**
 * Source comparator - Compare HTML source with baseline
 * @param {Object} page - Playwright page
 * @param {Object} data - Collected source data
 * @param {Object} config - Collector configuration
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison result
 */
export async function source(page, data, config, testInfo) {
  const options = config.options || {};
  const baselineDir = options.baselineDir || 'baselines/source';
  
  // Generate baseline filename
  const urlPath = new URL(data.url).pathname;
  const baselineName = `${urlPath}-source.html`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-');
  
  const baselinePath = path.join(baselineDir, baselineName);
  
  // Create baseline directory if it doesn't exist
  await fs.ensureDir(baselineDir);
  
  // Check if baseline exists
  if (!await fs.pathExists(baselinePath)) {
    // Create new baseline
    await fs.writeFile(baselinePath, data.content, 'utf8');
    return {
      passed: true,
      status: 'baseline-created',
      baselineName
    };
  }
  
  // Read existing baseline
  const baseline = await fs.readFile(baselinePath, 'utf8');
  
  // Compare
  if (baseline === data.content) {
    return {
      passed: true,
      status: 'match',
      baselineName
    };
  }
  
  // Calculate diff
  const diff = diffLines(baseline, data.content);
  const changes = diff.filter(part => part.added || part.removed);
  
  return {
    passed: false,
    status: 'mismatch',
    baselineName,
    changes: changes.length,
    diff: options.includeDiff ? diff : undefined
  };
}

