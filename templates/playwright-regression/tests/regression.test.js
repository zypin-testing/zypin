import { test, expect } from 'zypin/playwright';
import { runSuite } from 'zypin/regression';

// Test 1: Hello World - Basic Visual Regression
test('Hello World Visual Test', async ({ page, context }, testInfo) => {
  const results = await runSuite({
    page,
    context,
    suiteFile: './suites/hello-world.json',
    testInfo
  });
  
  expect(results.passed).toBe(true);
});

// Test 2: With Actions - Form Interactions
test('Form Interaction Test', async ({ page, context }, testInfo) => {
  const results = await runSuite({
    page,
    context,
    suiteFile: './suites/with-actions.json',
    testInfo
  });
  
  expect(results.passed).toBe(true);
});

// Test 3: With Validations - JS Errors & Status Codes
test('Validation Test', async ({ page, context }, testInfo) => {
  const results = await runSuite({
    page,
    context,
    suiteFile: './suites/with-validations.json',
    testInfo
  });
  
  expect(results.passed).toBe(true);
});
