export default {
  runner: 'playwright',
  
  // CLI arguments passed directly to playwright test
  // See: https://playwright.dev/docs/test-cli
  cliArgs: [
    '--reporter', 'html,list',
    // More reporters: 'json', 'junit', 'dot', 'line', 'github'
    // Other flags: '--workers=4', '--timeout=30000', '--project=chromium'
  ]
  
  // Note: Complex configurations (like screenshot paths, thresholds) can be
  // configured in suite.json or via environment variables
};

