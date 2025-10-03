import fs from 'fs';
import path from 'path';

/**
 * Load and parse suite configuration file
 * @param {string} suiteFile - Path to suite.json file
 * @returns {Promise<Array>} Parsed suite configuration
 */
export async function loadSuite(suiteFile) {
  const suitePath = path.resolve(suiteFile);
  
  if (!fs.existsSync(suitePath)) {
    throw new Error(`Suite file not found: ${suitePath}`);
  }
  
  const suiteData = fs.readFileSync(suitePath, 'utf8');
  const suite = JSON.parse(suiteData);
  
  if (!Array.isArray(suite)) {
    throw new Error('Suite configuration must be an array');
  }
  
  // Validate basic structure
  suite.forEach((test, index) => {
    if (!test.name) {
      throw new Error(`Suite item at index ${index} missing required field: name`);
    }
    if (!test.urls || !Array.isArray(test.urls)) {
      throw new Error(`Suite "${test.name}" missing required field: urls (must be array)`);
    }
    if (!test.viewports || !Array.isArray(test.viewports)) {
      throw new Error(`Suite "${test.name}" missing required field: viewports (must be array)`);
    }
  });
  
  return suite;
}

