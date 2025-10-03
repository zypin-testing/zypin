import { test, expect } from 'zypin/playwright';
import { runSuite } from 'zypin/regression';

test.describe('Regression Test Suite', () => {
  test('should run suite.json', async ({ page, context }, testInfo) => {
    const baseUrl = process.env.BASE_URL || '';
    
    const results = await runSuite({
      page,
      context,
      suiteFile: './suites/suite.json',
      testInfo,
      baseUrl
    });
    
    // Log results for debugging
    console.log('Test Results:', JSON.stringify(results, null, 2));
    
    // Assert that all tests passed
    expect(results.passed).toBe(true);
  });
});

