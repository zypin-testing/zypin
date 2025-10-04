export default {
  runner: 'playwright',
  
  // CLI arguments passed directly to playwright test
  // See: https://playwright.dev/docs/test-cli
  cliArgs: [
    // headless: true is default, use '--headed' for visible browser
    '--reporter', 'html,list',
    // More reporters: 'json', 'dot', 'line', 'github'
    // Other flags: '--workers=4', '--timeout=30000', '--project=chromium'
  ]
  
  // Note: Complex reporter configs (outputFolder, outputFile) require
  // a playwright.config.js file. CLI only supports simple reporter names.
};
