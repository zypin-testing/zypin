export default {
  runner: 'cucumber',
  
  // Browser: 'chrome' | 'firefox' | 'edge' | 'safari'
  browser: 'chrome',
  
  // Run browser in headless mode
  headless: false,
  
  // Additional browser arguments
  browserArgs: [
    // '--start-maximized',
    // '--disable-notifications',
    // '--no-sandbox',  // For CI/CD
  ],
  
  // Timeouts in milliseconds
  implicitWait: 10000,       // Element wait
  pageLoadTimeout: 30000,    // Page load
  scriptTimeout: 30000,      // Script execution
  cucumberTimeout: 30000,    // Step timeout
  
  // CLI arguments passed directly to cucumber-js
  // See: https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md
  cliArgs: [
    '--format', 'progress',
    '--format', 'html:./reports/cucumber-report.html',
    '--format', 'json:./reports/cucumber-report.json',
    '--format', 'junit:./reports/cucumber-junit.xml',
    // More formats: 'progress-bar', 'summary', 'usage', '@cucumber/pretty-formatter'
    // Other flags: '--strict', '--fail-fast', '--retry 2'
  ]
};
