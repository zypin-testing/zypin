import { registry } from './registry.js';

/**
 * Execute actions on a page
 * @param {Object} page - Playwright page object
 * @param {Object} context - Playwright context object
 * @param {Array} actions - Array of action configurations
 */
export async function executeActions(page, context, actions = []) {
  for (const action of actions) {
    const handler = registry.getAction(action.type);
    await handler(page, context, action);
  }
}

/**
 * Apply filters to collected data
 * @param {any} data - Collected data
 * @param {Array} filters - Array of filter configurations
 * @returns {Promise<any>} Filtered data
 */
async function applyFilters(data, filters = []) {
  let filteredData = data;
  
  for (const filterConfig of filters) {
    const handler = registry.getFilter(filterConfig.type);
    filteredData = await handler(filteredData, filterConfig);
  }
  
  return filteredData;
}

/**
 * Collect data from page
 * @param {Object} page - Playwright page object
 * @param {Array} collectors - Array of collector configurations
 * @returns {Promise<Object>} Collected data keyed by collector type
 */
export async function collectData(page, collectors = []) {
  const data = {};
  
  for (const collectorConfig of collectors) {
    const handler = registry.getCollector(collectorConfig.type);
    let collectedData = await handler(page, collectorConfig);
    
    // Apply filters if specified
    if (collectorConfig.filters && collectorConfig.filters.length > 0) {
      collectedData = await applyFilters(collectedData, collectorConfig.filters);
    }
    
    data[collectorConfig.type] = collectedData;
  }
  
  return data;
}

/**
 * Compare collected data with baselines
 * @param {Object} page - Playwright page object
 * @param {Object} data - Collected data
 * @param {Array} collectors - Collector configurations (includes comparator info)
 * @param {Object} testInfo - Playwright test info
 * @returns {Promise<Object>} Comparison results
 */
export async function compareData(page, data, collectors, testInfo) {
  const results = {};
  
  for (const collectorConfig of collectors) {
    if (!collectorConfig.comparator) {
      continue; // Skip if no comparator specified
    }
    
    const comparatorHandler = registry.getComparator(collectorConfig.comparator);
    const collectedData = data[collectorConfig.type];
    
    results[collectorConfig.type] = await comparatorHandler(
      page,
      collectedData,
      collectorConfig,
      testInfo
    );
  }
  
  return results;
}

