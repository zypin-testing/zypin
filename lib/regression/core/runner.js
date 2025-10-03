import { loadSuite } from './suite-loader.js';
import { executeActions, collectData, compareData } from './executor.js';

/**
 * Run a complete regression suite
 * @param {Object} options - Runner options
 * @param {Object} options.page - Playwright page object
 * @param {Object} options.context - Playwright context object
 * @param {string} options.suiteFile - Path to suite.json file
 * @param {Object} options.testInfo - Playwright test info
 * @param {string} options.baseUrl - Base URL for tests
 * @returns {Promise<Object>} Test results
 */
export async function runSuite({ page, context, suiteFile, testInfo, baseUrl = '' }) {
  const suite = await loadSuite(suiteFile);
  const results = [];

  for (const testCase of suite) {
    for (const url of testCase.urls) {
      for (const viewport of testCase.viewports) {
        // Set viewport
        await page.setViewportSize({ 
          width: viewport.width, 
          height: viewport.height 
        });

        // Set up listeners for jsErrors and statusCodes collectors
        page._jsErrors = [];
        page._responses = [];
        
        page.on('pageerror', error => {
          page._jsErrors.push(error.message);
        });
        
        page.on('console', msg => {
          if (msg.type() === 'error') {
            page._jsErrors.push(msg.text());
          }
        });
        
        page.on('response', response => {
          page._responses.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
          });
        });

        // Execute pre-navigation actions (like loadCookies)
        const preNavActions = (testCase.actions || []).filter(
          action => action.type === 'loadCookies'
        );
        await executeActions(page, context, preNavActions);

        // Navigate to page
        const fullUrl = baseUrl + url;
        await page.goto(fullUrl, { timeout: 60000 });
        await page.waitForLoadState('networkidle', { timeout: 60000 });

        // Execute post-navigation actions
        const postNavActions = (testCase.actions || []).filter(
          action => action.type !== 'loadCookies'
        );
        await executeActions(page, context, postNavActions);

        // Scroll page to load lazy content
        await page.evaluate(async () => {
          const scrollHeight = document.body.scrollHeight;
          const viewHeight = window.innerHeight / 2;
          const steps = Math.ceil(scrollHeight / viewHeight);
          for (let i = 0; i < steps; i++) {
            window.scrollTo(0, (i + 1) * viewHeight);
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          window.scrollTo(0, 0);
          await new Promise(resolve => setTimeout(resolve, 2000));
        });

        // Collect data
        const collectors = testCase.collect || [];
        const data = await collectData(page, collectors);

        // Compare data
        const comparisonResults = await compareData(page, data, collectors, testInfo);

        results.push({
          testCase: testCase.name,
          url,
          viewport: viewport.name,
          data,
          comparisons: comparisonResults
        });
      }
    }
  }

  return {
    passed: results.every(r => 
      Object.values(r.comparisons || {}).every(c => c.passed !== false)
    ),
    results
  };
}

